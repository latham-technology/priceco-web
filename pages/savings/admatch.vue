<template>
  <div>
    <PageTitle
      :images="[
        '/img/etc/admatch/adLg01.png',
        '/img/etc/admatch/adSm01.png',
        '/img/etc/admatch/adSm02.png',
      ]"
      title="Ad Match Guarantee"
    />

    <AppTypography>
      We are committed to providing every day low prices. On all of the products
      we carry. So, if you find a lower advertised price on an identical
      product, tell us and we'll match it! Right there at the register!
    </AppTypography>

    <AppTypography>
      Shop with confidence at PriceCo Foods. If an item you have purchased from
      PriceCo Foods is in a competitor’s printed ad at a lower price during the
      time of the initial purchase, PriceCo Foods will refund the difference
      within five (5) days. To claim an Ad Match Price Protection Policy
      adjustment, come into PriceCo Foods with a copy of your receipt within
      five (5) days of your purchase. Upon verification, you will be given a
      refund for the difference of the original selling price and the advertised
      competitor’s price.
    </AppTypography>

    <AppTypography>
      If an item that we normally carry is temporarily out of stock and is
      currently advertised in a local competitor’s printed ad, a rain check may
      be issued.
    </AppTypography>

    <div class="flex flex-col md:flex-row gap-8 my-10">
      <section>
        <h2 class="text-brand-blue text-lg font-semibold mb-4">
          We gladly match the price in the following types of ads:
        </h2>
        <ul class="list-disc flex flex-col gap-2 pl-4 mb-4">
          <li>
            We will match ONLY local Savemart or Safeway advertised price.
          </li>
          <li>
            We DO NOT require the customer to have the ad with them to honor any
            competitor's ad.
          </li>
          <li>
            Items purchased must be identical to the ad (size, quantity, brand,
            flavor, color, etc).
          </li>
          <li>
            For private label items in a printed ad, we will substitute with our
            Western Family Brand.
          </li>
          <li>Buy One Get One Free ads with a specified price.</li>
          <li>
            Preferred shopping card prices for specified items that are in a
            printed ad.
          </li>
        </ul>
        <img
          class="max-w-full object-contain"
          src="~/assets/img/etc/admatch/yes.jpg"
        />
      </section>
      <section>
        <h2 class="text-brand-blue text-lg font-semibold mb-4">
          We DO NOT match the price in the following types of competitor ads:
        </h2>

        <ul class="list-disc flex flex-col gap-2 pl-4 mb-4">
          <li>Ads when the actual price for items cannot be determined.</li>
          <li>Bakery/Deli, produce, meat or floral advertised prices.</li>
          <li>Internet pricing.</li>
          <li>Misprinted ad prices of other grocers.</li>
          <li>Percentages off.</li>
          <li>Going out of business or close-out prices.</li>
          <li>Competitor's ads outside the store's local trade territory.</li>
          <li>Items that require a separate purchase to get the ad price.</li>
          <li>
            Items with no actual price that require a purchase to get free
            product.
          </li>
          <li>
            Items that require a purchase to get a competitor’s gift card.
          </li>
          <li>
            Competitor's mail in offers, instant rebates or in-store coupons.
          </li>
        </ul>
        <img
          class="max-w-full object-contain"
          src="~/assets/img/etc/admatch/no.jpg"
        />
      </section>
    </div>

    <div class="text-red-200 text-sm">
      <AppTypography>See store for complete details.</AppTypography>
      <AppTypography
        >We Reserve The Right To Amend And/Or Cancel The Ad Match Program At Any
        Time Without Any Prior Warning. See store for complete details.
      </AppTypography>
      <AppTypography
        >Management reserves the right, in their best judgment of the situation,
        to enforce or amend each of the above rules.
      </AppTypography>
    </div>
  </div>
</template>
