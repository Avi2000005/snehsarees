import { useState } from "react";
import { Copy, Check, PackageCheck, Truck, Undo2 } from "lucide-react";
import "./ProductPerks.css";

export type Offer = {
  id: string | number;
  title: string; // e.g. "Welcome 10% off for new customers"
  code: string; // e.g. "WELCOME10"
  note?: string; // optional condition line from backend, e.g. "On orders above ₹1500"
};

type Props = {
  /** Active, currently valid offers. Must come from the backend/database only. */
  offers: Offer[];
  /** Free shipping threshold in INR. Pass from backend settings if you have it. */
  freeShippingAbove?: number | null;
  shippingPolicyHref: string;
  returnPolicyHref: string;
};

export function OfferTickets({ offers }: { offers: Offer[] }) {
  const [copiedId, setCopiedId] = useState<Offer["id"] | null>(null);

  if (!offers || offers.length === 0) return null;

  const copy = async (offer: Offer) => {
    try {
      await navigator.clipboard.writeText(offer.code);
      setCopiedId(offer.id);
      window.setTimeout(() => setCopiedId(null), 1800);
    } catch {
      /* clipboard blocked: the code stays visible, so the user can still copy it by hand */
    }
  };

  return (
    <section className="perks-offers" aria-label="Offers and coupon codes">
      <ul className="perks-offers__list">
        {offers.map((offer) => {
          const copied = copiedId === offer.id;
          return (
            <li className="ticket" key={offer.id}>
              <div className="ticket__body">
                <p className="ticket__title">{offer.title}</p>
                {offer.note && <p className="ticket__note">{offer.note}</p>}
              </div>
              <button
                type="button"
                className="ticket__stub"
                onClick={() => copy(offer)}
                aria-label={`Copy coupon code ${offer.code}`}
              >
                <span className="ticket__code">{offer.code}</span>
                <span className="ticket__hint" aria-live="polite">
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? "Copied" : "Tap to copy"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function ServicePerks({
  freeShippingAbove,
  shippingPolicyHref,
  returnPolicyHref,
}: Omit<Props, "offers">) {
  const showFreeShipping = typeof freeShippingAbove === "number" && freeShippingAbove > 0;
  const amount = showFreeShipping ? new Intl.NumberFormat("en-IN").format(freeShippingAbove) : null;

  return (
    <section className="perks-service" aria-label="Shipping and returns">
      <div className="zari" aria-hidden="true" />
      <ul className="perks-service__list">
        {showFreeShipping && (
          <li className="perk">
            <span className="perk__icon"><PackageCheck size={18} /></span>
            <div className="perk__content">
              <p className="perk__title">Free shipping</p>
              <p className="perk__text">On domestic orders above ₹{amount}</p>
            </div>
          </li>
        )}

        <li className="perk">
          <span className="perk__icon"><Truck size={18} /></span>
          <div className="perk__content">
            <p className="perk__title">2–7 days delivery</p>
            <p className="perk__text">
              Within India.{" "}
              <a className="perk__link" href={shippingPolicyHref}>Learn more</a>
            </p>
          </div>
        </li>

        <li className="perk">
          <span className="perk__icon"><Undo2 size={18} /></span>
          <div className="perk__content">
            <p className="perk__title">7-day returns</p>
            <p className="perk__text">
              From the day of delivery.{" "}
              <a className="perk__link" href={returnPolicyHref}>Learn more</a>
            </p>
          </div>
        </li>
      </ul>
    </section>
  );
}

/** Drop-in block: place right below the Add to Cart button. */
export default function ProductPerks({
  offers,
  freeShippingAbove,
  shippingPolicyHref,
  returnPolicyHref,
}: Props) {
  return (
    <div className="perks">
      <OfferTickets offers={offers} />
      <ServicePerks
        freeShippingAbove={freeShippingAbove}
        shippingPolicyHref={shippingPolicyHref}
        returnPolicyHref={returnPolicyHref}
      />
    </div>
  );
}
