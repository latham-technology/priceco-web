<template>
  <footer>
  <div class="wrap">
    <ul id="footnav">
      <li>
        <h5>Store</h5>
        <ul>
          <li><a href="/ad/">Weekly Specials</a></li>
          <?php
				$day = date('N');
				if(($day >= '4') && ($day <= '7')) {
            	//	echo '<li><a href="'.$threeDayUrl.'" target="_blank">3 Day Sale</a></li>';
				};
			?>
          <li><a href="https://maps.google.com/maps?daddr=Price+Co+Foods,+13765+Mono+Way,+Sonora,+CA&hl=en&sll=37.986351,-120.383273&sspn=0.013952,0.027874&oq=Price&mra=ls&t=m&z=17" target="_blank">Directions</a></li>
          <!--<li><a href="/etc/list.php">Shopping List</a></li>-->
          <li><a href="/services/">Services</a></li>
        </ul>
      </li>
      <li>
        <h5>Products</h5>
        <ul>
          <li><a href="/products/glutenfree/">Gluten Free</a></li>
          <li><a href="/products/wine/">Gourmet Wines</a></li>
          <!--<li><a href="/departments/bakery/order/">Custom Cake Order</a></li>-->
          <!-- <li><a href="/departments/deli/order/">Deli Tray Order</a></li> -->
          <li><a href="/products/order/">New Item Request</a></li>
        </ul>
      </li>
      <li>
        <h5>Company Info</h5>
        <ul>
          <!--<li><a href="/about/meetus.php">Meet Us</a></li>-->
          <li><a href="/about/">Customer Service</a></li>
          <li><a href="/savings/admatch/">Ad Match Guarantee</a></li>
        </ul>
      </li>
      <li>
        <h5>Community</h5>
        <ul>
          <li><a href="http://junctionshoppingcenter.com" target="_blank">Junction Shopping</a></li>
          <li><a href="http://www.co.tuolumne.ca.us/" target="_blank">Tuolumne County</a></li>
          <li><a href="/savings/scrip/">Scrip Program</a></li>
        </ul>
      </li>
      <li>
      <h5>Careers</h5>
        <ul>
          <li><a href="/jobs/">Apply</a></li>
        </ul>
        
      </li>
      <li id="connect">
        <h5>Connect</h5>
        <ul>
          <li><a href="http://www.facebook.com/profile.php?id=100001882288907" target="_blank"><img src="/img/fb.png" alt="Like us on Facebook!" width="32" height="32"></a></li>
        </ul>
      </li>
    </ul>
    <div id="copyright"><p>&copy; PriceCo Foods 2012-2017. All rights reserved.</p><p>Designed by <a href="http://mattlatham.me">Matt Latham Web Design</a></p></div>
  </div>
</footer>
</template>