// Helper functions
function replaceUrlParam(url, paramName, paramValue) {
  var pattern = new RegExp('('+paramName+'=).*?(&|$)'),
      newUrl = url.replace(pattern,'$1' + paramValue + '$2');
  if ( newUrl == url ) {
    newUrl = newUrl + (newUrl.indexOf('?')>0 ? '&' : '?') + paramName + '=' + paramValue;
  }
  return newUrl;
}

// Timber functions
window.timber = window.timber || {};

timber.cacheSelectors = function () {
  timber.cache = {
    // General
    $html: $('html'),
    $body: $('body'),

    // Navigation
    $navigation: $('#AccessibleNav'),

    // Product Page
    $productImageWrap: $('#ProductPhoto'),
    $productImage: $('#ProductPhotoImg'),
    $thumbImages: $('#ProductThumbs').find('a.product-single__thumbnail')
  }
};

timber.init = function () {
  // FastClick.attach(document.body);
  timber.cacheSelectors();
  timber.accessibleNav();
  timber.productImageSwitch();
  timber.autoResponsiveElements();
  timber.productImageZoom();
};

timber.accessibleNav = function () {
  var $nav = timber.cache.$navigation,
      $allLinks = $nav.find('a'),
      $topLevel = $nav.children('li').find('a'),
      $parents = $nav.find('.site-nav--has-dropdown'),
      $subMenuLinks = $nav.find('.site-nav__dropdown').find('a'),
      activeClass = 'nav-hover',
      focusClass = 'nav-focus';

  // Mouseenter
  $parents.on('mouseenter touchstart', function(evt) {
    var $el = $(this);

    if (!$el.hasClass(activeClass)) {
      evt.preventDefault();
    }
    
    var header_height = $(this).position().top + $(this).height() - 1;
      
    $(this).find('.site-nav__dropdown').css('top',header_height+'px');

    showDropdown($el);
  });

  // Mouseout
  $parents.on('mouseleave', function() {
    hideDropdown($(this));
  });

  $subMenuLinks.on('touchstart', function(evt) {
    // Prevent touchstart on body from firing instead of link
    evt.stopImmediatePropagation();
  });

  $allLinks.focus(function() {
    handleFocus($(this));
  });

  $allLinks.blur(function() {
    removeFocus($topLevel);
  });

  // accessibleNav private methods
  function handleFocus ($el) {
    var $subMenu = $el.next('ul'),
        hasSubMenu = $subMenu.hasClass('sub-nav') ? true : false,
        isSubItem = $('.site-nav__dropdown').has($el).length,
        $newFocus = null;

    // Add focus class for top level items, or keep menu shown
    if (!isSubItem) {
      removeFocus($topLevel);
      addFocus($el);
    } else {
      $newFocus = $el.closest('.site-nav--has-dropdown').find('a');
      addFocus($newFocus);
    }
  }

  function showDropdown ($el) {
    $el.addClass(activeClass);
    
    setTimeout(function() {
      timber.cache.$body.on('touchstart', function() {
        hideDropdown($el);
      });
    }, 250);
  }

  function hideDropdown ($el) {
    $el.removeClass(activeClass);
    timber.cache.$body.off('touchstart');
  }

  function addFocus ($el) {
    $el.addClass(focusClass);
  }

  function removeFocus ($el) {
    $el.removeClass(focusClass);
  }
};

timber.productPage = function (options) {
  
  var moneyFormat = options.money_format,
      variant = options.variant,
      selector = options.selector,
      translations = options.translations;

  // Selectors
  var $productImage = $('#ProductPhotoImg'),
      $addToCart = $('.addToCart-btn'),
      $MobileAddToCart = $('#MobileAddToCart'),
      $productPrice = $('#ProductPrice'),
      $comparePrice = $('#ComparePrice'),
      $comparePricePercent = $('#ComparePricePercent'),
      $quantityElements = $('.product-single__quantity, label + .js-qty'),
      $addToCartText = $('#AddToCartText'),
      $AddToCartTexts = $('.AddToCartTexts'),
      $BuyNowButton = $('.BuyNowButton');


  if (variant) {
    
    // Update variant image, if one is set
    if (variant.featured_image) {
      // var newImg = variant.featured_image,
      //     el = $productImage[0];
      // EasyStore.Image.switchImage(newImg, el, timber.switchImage);
      
      var slide_to_img = variant.featured_image.id;
      if($(".flexslider").length){
      	$(".flexslider").flexslider($('#image-id-'+slide_to_img).index());
      }
    }

    // Select a valid variant if available
    if (variant.available) {
      // Available, enable the submit button, change text, show quantity elements
      $addToCart.removeClass('disabled').prop('disabled', false);
      $MobileAddToCart.removeClass('disabled').prop('disabled', false);
      $addToCartText.html(translations.add_to_cart);
      $AddToCartTexts.html(translations.add_to_cart);
      $BuyNowButton.removeClass('hide');
      // $quantityElements.removeClass('hide');
    } else {
      // Sold out, disable the submit button, change text, hide quantity elements
      $addToCart.addClass('disabled').prop('disabled', true);
      $MobileAddToCart.addClass('disabled').prop('disabled', true);
      $addToCartText.html(translations.sold_out);
      $AddToCartTexts.html(translations.sold_out);
      $BuyNowButton.addClass('hide');
      // $quantityElements.addClass('hide');
    }

    // Regardless of stock, update the product price
    $productPrice.html( EasyStore.formatMoney(variant.price, moneyFormat) );
    // $productPrice.html(variant.price);

    // Also update and show the product's compare price if necessary
    if (variant.compare_at_price > variant.price) {
      $comparePrice
        .html(EasyStore.formatMoney(variant.compare_at_price, moneyFormat))
        // .html(variant.compare_at_price)
        .show();
      if(variant.price > 0){
        var comparePricePercent = (variant.compare_at_price - variant.price) / variant.compare_at_price * 100;
        $comparePricePercent.text('-'+Math.round( comparePricePercent * 10 ) / 10 +'%').show();
      }
    } else {
      $comparePrice.hide();
      $comparePricePercent.hide();
    }

  } else {
    // The variant doesn't exist, disable submit button.
    // This may be an error or notice that a specific variant is not available.
    // To only show available variants, implement linked product options:
    //   - http://docs.EasyStore.com/manual/configuration/store-customization/advanced-navigation/linked-product-options
    $addToCart.addClass('disabled').prop('disabled', true);
    $addToCartText.html(translations.unavailable);
    $AddToCartTexts.html(translations.unavailable);
    $quantityElements.hide();
  }
};

timber.productImageSwitch = function () {
  if (timber.cache.$thumbImages.length) {
    // Switch the main image with one of the thumbnails
    // Note: this does not change the variant selected, just the image
    timber.cache.$thumbImages.on('click', function(evt) {
      evt.preventDefault();
      var newImage = $(this).attr('href');
      var newImageId = $(this).attr('data-image-id');
      timber.switchImage(newImage, { id: newImageId }, timber.cache.$productImage);
    });
  }
};

timber.switchImage = function (src, imgObject, el) {
  // Make sure element is a jquery object
  var $el = $(el);
  $el.attr('src', src);
  $el.attr('data-image-id', imgObject.id);

  
};

timber.autoResponsiveElements = function () {
  var $iframeVideo = $('iframe[src*="youtube.com/embed"], iframe[src*="player.vimeo"], iframe[src*="facebook.com"]');
  var $iframeReset = $iframeVideo.add('iframe#admin_bar_iframe');

  $('table').wrap('<div class="table-wrapper"></div>');

  $iframeVideo.each(function () {
    // Add wrapper to make video responsive
    $(this).wrap('<div class="video-wrapper"></div>');
  });

  $iframeReset.each(function () {
    // Re-set the src attribute on each iframe after page load
    // for Chrome's "incorrect iFrame content on 'back'" bug.
    // https://code.google.com/p/chromium/issues/detail?id=395791
    // Need to specifically target video and admin bar
    this.src = this.src;
  });
};

timber.productImageZoom = function () {
  
    return;
  

  if (!timber.cache.$productImageWrap.length || timber.cache.$html.hasClass('supports-touch')) {
    return;
  };

  // Destroy zoom (in case it was already set), then set it up again
  timber.cache.$productImageWrap.trigger('zoom.destroy');

  timber.cache.$productImageWrap.addClass('image-zoom').zoom({
    url: timber.cache.$productImage.attr('data-zoom')
  });
};

// Initialize Timber's JS on docready
$(timber.init)
