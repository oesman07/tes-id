/* Simple jQuery Equal Heights @version 1.5.1. Copyright (c) 2013 Matt Banks. Dual licensed under the MIT and GPL licenses. */
!function(a){a.fn.equalHeights=function(){var b=0,c=a(this);return c.each(function(){var c=a(this).innerHeight();c>b&&(b=c)}),c.css("height",b)},a("[data-equal]").each(function(){var b=a(this),c=b.data("equal");b.find(c).equalHeights()})}(jQuery);

/* Run function after window resize */
var afterResize=(function(){var t={};return function(callback,ms,uniqueId){if(!uniqueId){uniqueId="Don't call this twice without a uniqueId";}if(t[uniqueId]){clearTimeout(t[uniqueId]);}t[uniqueId]=setTimeout(callback,ms);};})();

window.theme = window.theme || {};

theme.cacheSelectors = function () {
  theme.cache = {
    // General
    $w: $(window),
    $body: $('body'),
    $pageContainer: $('#PageContainer'),

    // Mobile Nav
    $mobileNavTrigger: $('.MobileNavTrigger'),
    $mobileNav: $('#MobileNav'),
    $mobileSublistTrigger: $('.mobile-nav__sublist-trigger'),
    $MobileNavOutside: $("#MobileNavOutside"),
    
     // Cart Drawer
    $cartDrawerTrigger: '.CartDrawerTrigger',

    // Equal height elements
    $productGridImages: $('.grid-link__image--product'),
    $featuredGridImages: $('.grid-link__image--collection'),

    // Product page
    $productImage: $('#ProductPhotoImg'),
    $productImageGallery: $('.gallery__item'),
    $productZoom: $('.product-zoomable'), 

    // Cart Page
    cartNoteAdd: '.cart__note-add',
    cartNote: '.cart__note',

    // Add to cart - Ajax
    $cartCount: $('.cart-count'),
    $addToCartBtn: $('.addToCart-btn'),
    
    $addToCartBtnList: '.addToCartList',

    //Navigation
    $hasDropdownItem: $('.site-nav--has-dropdown')
  }
};

timber.cacheVariables = function () {
  timber.vars = {
    isTouch: timber.cache.$html.hasClass('supports-touch')
  }
};

theme.init = function () {
  theme.cacheSelectors();
  theme.mobileNav();
  timber.cacheVariables();
  theme.equalHeights();
  theme.cartPage();
  theme.toggleMenu();
  
  theme.addToCartList();
  
  theme.productImageGallery();
  
  theme.enableAjax();
  
};


function toggleMobileNavOutside(x){
  theme.cache.$MobileNavOutside.toggleClass(x);
}
function toggleCart(){
  $('.cart-drawer').toggleClass('is-active');
  $('html').toggleClass('cart-is-active');
  toggleMobileNavOutside('cart-active');
  
  if($('#CartDrawer').attr('data-fetch') == 0){
      var header_height = $('.header-bar').height();
      $('#CartDrawer .cart-drawer-wrapper').css('top',header_height+'px');
  }
}

theme.toggleCart = function(){
  $('#CartDrawer').removeClass('hasCartItem noCartItem');
  toggleCart();
}

theme.addToCartList = function () {
  
  theme.cache.$body.on('click', theme.cache.$addToCartBtnList, function() {
    	$(this).addClass('btn--loading');
        var self = $(this),
            v_id = Number($(this).attr('data-id')),
            v_qty = 1,
            cartCount = $('.cart-count'),
            token = Number($(this).attr('data-token'));

    	$.ajax({
            type: "POST",
            dataType: 'json',
            url: "/cart/add?retrieve=true",
            data:{
                id: v_id,
                quantity: v_qty,
                _token: token
            },
            success: function(data, status){
                $(self).removeClass('btn--loading');
                cartCount.removeClass('hidden-count');
                cartCount.text(data.item_count);
              	// toggleCart();
                popToast(add_cart_success_html)
                theme.cartDrawer(data);
              
            },
            error: function(xhr){
              console.log('error',xhr);
              $(self).removeClass('btn--loading');
              if(xhr.responseJSON.description != undefined){
                popToast(xhr.responseJSON.description)
              }
              
            }
      	});
  });
  
};


theme.mobileNav = function () {
  
  function MobileNavToggle(){
  	theme.cache.$mobileNav.toggleClass('is-active');
    $('html').toggleClass('MobileNav-is-active');
    toggleMobileNavOutside('nav-active');
    theme.cache.$mobileNavTrigger.toggleClass('is-active');
    if (theme.cache.$mobileNavTrigger.hasClass('is-active')) {
      $(".MobileNavTrigger .icon").removeClass("icon-hamburger");
      $(".MobileNavTrigger .icon").addClass("icon-x");
    }else{
      $(".MobileNavTrigger .icon").removeClass("icon-x");
      $(".MobileNavTrigger .icon").addClass("icon-hamburger");
    }
  };
  
  theme.cache.$mobileNavTrigger.on('click', function() {
    // theme.cache.$mobileNav.slideToggle(220);
    MobileNavToggle();
    
  });
  
  theme.cache.$MobileNavOutside.on('click', function() {
    if($(this).hasClass('nav-active')){
  		MobileNavToggle();
    }else{
      toggleCart();
    }
  });
  
  theme.cache.$body.on('click', theme.cache.$cartDrawerTrigger, function() {
  	toggleCart();
    if($('#CartDrawer').attr('data-fetch') == 0){
  		theme.fetchCartDrawer();
    }
  });

  theme.cache.$mobileSublistTrigger.on('click', function(evt) {
    var $el = $(this);

    // Enable commented out if statement to allow direct clicking on trigger link
    // if (!$el.hasClass('is-active')) {
      evt.preventDefault();
      $el.toggleClass('is-active').next('.mobile-nav__sublist').slideToggle(200);
    // }
  });
};

theme.equalHeights = function () {
  if($('.product-list-grid').attr('data-equal-height')){
//     theme.cache.$w.on('load', resizeElements());

//     theme.cache.$w.on('resize',
//       afterResize(function() {
//         resizeElements();
//       }, 250, 'equal-heights')
//     );

//     function resizeElements() {
//       theme.cache.$productGridImages.css('height', 'auto').equalHeights();
//       theme.cache.$featuredGridImages.css('height', 'auto').equalHeights();
//     }
  }
};

theme.productImageGallery = function() {

  if (!theme.cache.$productImageGallery.length) {
    return;
  };

  theme.cache.$productImageGallery.magnificPopup({
    type: 'image',
    mainClass: 'mfp-fade',
    closeOnBgClick: true,
    closeBtnInside: false,
    closeOnContentClick: true,
    tClose: 'Close (Esc)',
    removalDelay: 500,
    callbacks: {
      open: function(){
        $('html').css('overflow-y','hidden');
      },
      close: function(){
        $('html').css('overflow-y','');
      }
    },
    gallery: {
      enabled: true,
      navigateByImgClick: false,
      arrowMarkup: '<button title="%title%" type="button" class="mfp-arrow mfp-arrow-%dir%"><span class="mfp-chevron mfp-chevron-%dir%"></span></button>',
      tPrev: 'Previous (Left arrow key)',
      tNext: 'Next (Right arrow key)'
    }
  });

  theme.cache.$productZoom.bind('click', function() {
    var imageId = $(this).attr('data-image-id');
    theme.cache.$productImageGallery.filter('[data-image-id="' + imageId + '"]').trigger('click');
  });
};

theme.cartPage = function () {
  
    return;
  

  theme.cache.$body.on('click', theme.cache.cartNoteAdd, function () {
    $(this).addClass('is-hidden');
    $(theme.cache.cartNote).addClass('is-active');
    ajaxifyEasyStore.sizeDrawer();
  });
};

theme.backButton = function () {
  var referrerDomain = urlDomain(document.referrer);
  var shopDomain = urlDomain(document.url);

  if (shopDomain === referrerDomain) {
    history.back();
    return false;
  }

  function urlDomain(url) {
    var    a      = document.createElement('a');
           a.href = url;
    return a.hostname;
  }
};

theme.addToCartflip = function ($addToCartBtn) {

  // Get label of add to cart button
  var addToCartText = $addToCartBtn.attr('data-add-to-cart') || "Add to Cart";

  // Make a copy of the add to cart button should we flip it
  $addToCartBtn
    .clone(true)
    .prop('disabled', false)
    .removeClass('disabled')
    .addClass('btn--unflipped')
    .find('span')
    .text(addToCartText)
    .end()
    .hide()
    .insertAfter($addToCartBtn);

  $addToCartBtn
    .unbind('click')
    .removeClass('disabled')
    .find('span')
    .text(view_cart).before('<i class="fa fa-shopping-cart"></i> ')
    .end()
    .bind('click', function(e) {
      e.preventDefault();
      window.location.href = '/cart';
    })
    .prop('disabled', false)
    .addClass('btn--flipped')
    .after('<span class="continue-shopping"> <a class="btn btn--secondary" href="/collections/all">'+continue_shopping+'</a></span>');

  $('.continue-shopping a').bind('click', theme.backButton);

  // Unflip button if another variant is selected
  $('.single-option-selector, [name="quantity"]').bind('click', function() {
    $(this).closest('form').find('.btn--flipped, .continue-shopping, .note').remove();
    $(this).closest('form').find('.btn--unflipped').removeClass('.btn--unflipped').show();
  });
};

theme.enableAjax = function () {
  theme.cache.$addToCartBtn.bind('click', function(e) {
    e.preventDefault();
    $('.note.errors').remove();
    var $addToCartBtn = $(this),
        $addToCartForm = $(this).closest('form'),
        $addToCartBtnText = $(this).find('span');
    if ($addToCartForm.length) {
      $addToCartBtn
        .attr('data-add-to-cart', $addToCartBtnText.text())
        .prop('disabled', true)
        .addClass('disabled')
        .addClass('btn--loading');
      $.ajax({
        url: '/cart/add?retrieve=true',
        type: 'post',
        dataType: 'json',
        data: $addToCartForm.serialize(),
        success: function(data, status) {
          // console.log('data',data);
          // console.log('status',status);
          theme.cartDrawer(data);
          // theme.toggleCart();
          popToast(add_cart_success_html)
          
          theme.cache.$cartCount.text(data.item_count);
          $('.hidden-count').removeClass('hidden-count');
          $addToCartBtn.removeClass('btn--loading');
          $addToCartBtn.removeClass('disabled');
          $addToCartBtn.prop('disabled', false);
          // theme.addToCartflip($addToCartBtn);
        },
        error: function(XMLHttpRequest, textStatus) {
          var data = eval('(' + XMLHttpRequest.responseText + ')');
          var response = data.description;
          var status = XMLHttpRequest.status;
          $addToCartBtn.removeClass('btn--loading');
          if (status === 422 && $('#productSelect option').length === 1) {
            $addToCartBtnText.text("Sold Out");
          }
          else {
            $addToCartBtn.prop('disabled', false).removeClass('disabled');
            $addToCartBtnText.text($addToCartBtn.attr('data-add-to-cart'));
          }
          if($addToCartBtn.attr('data-float-btn') == true){
            $('#floating_action-bar').after('<p id="AddToCartErrors" class="note errors">' + response + '</p>');
            $([document.documentElement, document.body]).animate({
                scrollTop: ($("#AddToCartErrors").offset().top) - 230
            }, 600);
          }else{
          	$addToCartBtn.after('<p class="note errors">' + response + '</p>');
          }
        }
      });
    }
  });
};

theme.toggleMenu = function () {
  var $doc = $(document);
  var showDropdownClass = 'show-dropdown';

  // Open sub navs on small screens
  theme.cache.$hasDropdownItem.on('click', function(evt) {
    var $el = $(this);

    if (!$el.hasClass(showDropdownClass) && timber.vars.isTouch) {
      evt.preventDefault();
      $el.addClass(showDropdownClass);
      $doc.on('click', handleClickOutsideDropdown);
    }

    function handleClickOutsideDropdown (evt) {
      var $target = $(evt.target);

      if (!$target.is($el) && !$.contains($el[0], $target[0])) {
        $el.removeClass(showDropdownClass);
        $doc.off('click', handleClickOutsideDropdown)
      }
    }
  })
};

$('#app__product_promotionDialog-form_submit').on('click', function () {
  $('#CartDrawer').attr('data-fetch', 0);
});

// Initialize theme's JS on docready
$(theme.init)
