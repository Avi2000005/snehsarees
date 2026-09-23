import { Request, Response, NextFunction } from 'express';
import { db } from '../data/db';
import { ENV } from '../config/env';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { generateAndStoreOtp, verifyOtp, hasOtp } from '../services/otp.store';
import { sendOtpEmail } from '../services/brevo.service';
import { User } from '../models/user.model';

const getCookieDomain = (req: Request) => {
  if (ENV.NODE_ENV !== 'production') return undefined;
  const host = req.headers.host || '';
  if (host.includes('snehsarees.in')) {
    return '.snehsarees.in';
  }
  const parts = host.split(':')[0].split('.');
  if (parts.length >= 2) {
    return '.' + parts.slice(-2).join('.');
  }
  return undefined;
};

const setTokenCookie = (req: Request, res: Response, token: string, maxAgeMs: number = 30 * 24 * 60 * 60 * 1000) => {
  const domain = getCookieDomain(req);
  res.cookie('token', token, {
    httpOnly: true,
    secure: ENV.NODE_ENV === 'production',
    sameSite: ENV.NODE_ENV === 'production' ? 'none' : 'lax',
    domain: domain,
    maxAge: maxAgeMs
  });
};

// ─── STEP 1: Send OTP for registration ───────────────────────────────────────
export const sendRegistrationOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    // Check if email is already registered
    const existing = await db.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'This email is already registered. Please login.' });
    }

    const otp = generateAndStoreOtp(email);
    await sendOtpEmail(email, otp, 'verify');

    return res.json({ success: true, message: `Verification OTP sent to ${email}` });
  } catch (err) {
    next(err);
  }
};

// ─── STEP 2: Register with OTP verification ───────────────────────────────────
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp, password, name, username, phone } = req.body;

    if (!email || !otp || !password || !name || !username || !phone) {
      return res.status(400).json({ error: 'All fields (Email, OTP, Full Name, Username, Phone Number, Password) are required.' });
    }

    if (username.trim().length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters.' });
    }

    if (phone.replace(/\D/g, '').length < 10) {
      return res.status(400).json({ error: 'Enter a valid 10-digit phone number.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    // Verify OTP
    const otpValid = verifyOtp(email, otp);
    if (!otpValid) {
      return res.status(400).json({ error: 'Invalid or expired OTP. Please request a new one.' });
    }

    const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');
    const cleanPhone = phone.trim();

    // Check if email not taken
    const existingEmail = await db.getUserByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ error: 'This email is already registered. Please login.' });
    }

    // Check if username not taken
    const existingUsername = await db.getUserByUsername(cleanUsername);
    if (existingUsername) {
      return res.status(400).json({ error: 'This username is already taken. Please choose another.' });
    }

    // Check if phone not taken
    const existingPhone = await db.getUserByPhone(cleanPhone);
    if (existingPhone) {
      return res.status(400).json({ error: 'This phone number is already registered to an account.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.createUser({
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      name: name.trim(),
      username: cleanUsername,
      phone: cleanPhone,
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, phone: user.phone, role: 'user' },
      ENV.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Auto-link any past guest orders placed with this email or phone
    try {
      const linkedCount = await db.linkGuestOrders(user.id, user.email, user.phone);
      if (linkedCount > 0) {
        console.log(`[Auto-Link] Successfully linked ${linkedCount} past guest order(s) to new user #${user.id} (${user.email})`);
      }
    } catch (linkErr) {
      console.error('[Auto-Link] Error linking guest orders on register:', linkErr);
    }

    setTokenCookie(req, res, token);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        phone: user.phone,
        addresses: user.addresses || []
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, phone, password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required.' });
    }

    // 1. Admin Email Login
    if (email && email.toLowerCase() === ENV.ADMIN_EMAIL.toLowerCase()) {
      if (password === ENV.ADMIN_PASSWORD) {
        const token = jwt.sign(
          { role: 'admin', email: ENV.ADMIN_EMAIL },
          ENV.JWT_SECRET,
          { expiresIn: '1d' }
        );
        setTokenCookie(req, res, token, 24 * 60 * 60 * 1000);
        return res.json({
          token,
          user: {
            id: 0,
            email: ENV.ADMIN_EMAIL,
            name: 'Administrator',
            role: 'admin',
          },
        });
      }
      return res.status(401).json({ error: 'Invalid admin email or password.' });
    }

    // 2. Customer Email / Username / Phone Login
    const loginIdentifier = (email || phone || '').trim();
    if (loginIdentifier) {
      let user = await db.getUserByEmail(loginIdentifier);
      if (!user) {
        user = await db.getUserByUsername(loginIdentifier.toLowerCase().replace(/[^a-z0-9_]/g, ''));
      }
      if (!user) {
        user = await db.getUserByPhone(loginIdentifier);
      }

      if (!user || !user.password) {
        return res.status(401).json({ error: 'No account found with this email, username, or phone. Please register first.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Incorrect password. Please try again.' });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email, phone: user.phone, role: 'user' },
        ENV.JWT_SECRET,
        { expiresIn: '30d' }
      );

      // Auto-link any past guest orders placed with this email or phone
      try {
        const linkedCount = await db.linkGuestOrders(user.id, user.email, user.phone);
        if (linkedCount > 0) {
          console.log(`[Auto-Link] Successfully linked ${linkedCount} past guest order(s) to user #${user.id} on login`);
        }
      } catch (linkErr) {
        console.error('[Auto-Link] Error linking guest orders on login:', linkErr);
      }

      setTokenCookie(req, res, token);

      return res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          phone: user.phone,
          addresses: user.addresses || [],
          role: 'user',
        },
      });
    }

    // 3. Legacy Customer Phone Login (backwards compat)
    if (phone) {
      const user = await db.getUserByPhone(phone);

      let isMatch = false;
      if (user) {
        isMatch = await bcrypt.compare(password, user.password || '');

        // Fallback check for legacy SHA-256 password hash
        if (!isMatch && user.password && user.password.length === 64) {
          const sha256Hash = crypto.createHash('sha256').update(password).digest('hex');
          if (sha256Hash === user.password) {
            isMatch = true;
            try {
              const newBcryptHash = await bcrypt.hash(password, 10);
              await db.updateUserPassword(user.id, newBcryptHash);
            } catch (err) {
              console.error(`Failed to auto-upgrade password hash for user ${user.id}:`, err);
            }
          }
        }
      }

      if (!user || !isMatch) {
        return res.status(401).json({ error: 'Invalid phone number or password.' });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email, phone: user.phone, role: 'user' },
        ENV.JWT_SECRET,
        { expiresIn: '30d' }
      );

      try {
        await db.linkGuestOrders(user.id, user.email, user.phone);
      } catch {}

      setTokenCookie(req, res, token);

      return res.json({
        token,
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          role: 'user',
        },
      });
    }

    return res.status(400).json({ error: 'Please provide an email address and password.' });
  } catch (err) {
    next(err);
  }
};

// ─── Forgot Password: Send OTP ────────────────────────────────────────────────
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    const user = await db.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        error: 'No account found with this email. Please register first.',
        notFound: true,
      });
    }

    const otp = generateAndStoreOtp(email);
    await sendOtpEmail(email, otp, 'reset');

    return res.json({ success: true, message: `Password reset OTP sent to ${email}` });
  } catch (err) {
    next(err);
  }
};

// ─── Reset Password with OTP ──────────────────────────────────────────────────
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'Email, OTP, and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const otpValid = verifyOtp(email, otp);
    if (!otpValid) {
      return res.status(400).json({ error: 'Invalid or expired OTP. Please request a new one.' });
    }

    const user = await db.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.updateUserPassword(user.id, hashedPassword);

    return res.json({ success: true, message: 'Password reset successfully. You can now login.' });
  } catch (err) {
    next(err);
  }
};

// ─── Logout ───────────────────────────────────────────────────────────────────
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const domain = getCookieDomain(req);
    res.clearCookie('token', {
      httpOnly: true,
      secure: ENV.NODE_ENV === 'production',
      sameSite: ENV.NODE_ENV === 'production' ? 'none' : 'lax',
      domain: domain
    });
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
};

// ─── Get Current User ─────────────────────────────────────────────────────────
export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userReq = req as any;
    if (!userReq.user) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }
    if (userReq.user.role === 'admin' || userReq.user.id === 0) {
      return res.json({
        id: 0,
        email: ENV.ADMIN_EMAIL,
        name: 'Administrator',
        role: 'admin',
        addresses: []
      });
    }
    const user = await db.getUserById(userReq.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({
      id: user.id,
      email: user.email,
      phone: user.phone,
      username: user.username,
      name: user.name,
      addresses: user.addresses || []
    });
  } catch (err) {
    next(err);
  }
};

// ─── Send Email Update OTP ───────────────────────────────────────────────────
export const sendEmailUpdateOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userReq = req as any;
    if (!userReq.user) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }
    const user = await db.getUserById(userReq.user.id);
    if (!user || !user.email) {
      return res.status(400).json({ error: 'No email associated with this account to verify.' });
    }

    const otp = generateAndStoreOtp(user.email);
    await sendOtpEmail(user.email, otp, 'verify');

    return res.json({ success: true, message: `Verification OTP sent to your current email (${user.email})` });
  } catch (err) {
    next(err);
  }
};

// ─── Update Profile ──────────────────────────────────────────────────────────
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userReq = req as any;
    if (!userReq.user) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }

    const currentUser = await db.getUserById(userReq.user.id);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const { name, username, phone, email, password, addresses, emailOtp } = req.body;

    const updateData: Partial<User> = {};

    if (name !== undefined) {
      if (!name.trim()) return res.status(400).json({ error: 'Name cannot be empty.' });
      updateData.name = name.trim();
    }

    if (username !== undefined) {
      const cleanedUsername = username.trim().toLowerCase();
      if (cleanedUsername && cleanedUsername !== (currentUser.username || '').toLowerCase()) {
        // Validate uniqueness of new username
        const existingUsername = await db.getUserByUsername(cleanedUsername);
        if (existingUsername) {
          return res.status(400).json({ error: 'Username is already taken.' });
        }
        updateData.username = cleanedUsername;
      } else if (!cleanedUsername) {
        updateData.username = undefined; // clear it if empty (nullable)
      }
    }

    if (phone !== undefined) {
      updateData.phone = phone.trim() || undefined;
    }

    if (addresses !== undefined) {
      if (!Array.isArray(addresses)) {
        return res.status(400).json({ error: 'Addresses must be an array.' });
      }
      updateData.addresses = addresses;
    }

    if (password !== undefined && password.trim() !== '') {
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters.' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    // Email change with OTP verification of previous email
    if (email !== undefined && email.trim() !== '') {
      const newEmail = email.trim().toLowerCase();
      if (newEmail !== (currentUser.email || '').toLowerCase()) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
          return res.status(400).json({ error: 'Please provide a valid new email address.' });
        }

        // Verify if new email is already taken
        const existingEmail = await db.getUserByEmail(newEmail);
        if (existingEmail) {
          return res.status(400).json({ error: 'This email is already registered to another account.' });
        }

        // We require OTP verification on the current email
        if (!currentUser.email) {
          // If no previous email existed, we just update it
          updateData.email = newEmail;
        } else {
          if (!emailOtp) {
            return res.status(400).json({ error: 'Verification code for your current email is required to update the email address.' });
          }
          const otpValid = verifyOtp(currentUser.email, emailOtp);
          if (!otpValid) {
            return res.status(400).json({ error: 'Invalid or expired OTP code for current email.' });
          }
          updateData.email = newEmail;
        }
      }
    }

    if (Object.keys(updateData).length > 0) {
      await db.updateUser(currentUser.id, updateData);
    }

    // Fetch updated user to return
    const updatedUser = await db.getUserById(currentUser.id);

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser ? {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        phone: updatedUser.phone,
        name: updatedUser.name,
        addresses: updatedUser.addresses || []
      } : null
    });
  } catch (err) {
    next(err);
  }
};

// ─── Delete Account ──────────────────────────────────────────────────────────
export const deleteAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userReq = req as any;
    if (!userReq.user) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }

    const userId = userReq.user.id;
    await db.deleteUser(userId);

    // Clear session cookie
    const domain = getCookieDomain(req);
    res.clearCookie('token', {
      httpOnly: true,
      secure: ENV.NODE_ENV === 'production',
      sameSite: ENV.NODE_ENV === 'production' ? 'none' : 'lax',
      domain: domain
    });

    return res.json({ success: true, message: 'Account deleted successfully.' });
  } catch (err) {
    next(err);
  }
};
