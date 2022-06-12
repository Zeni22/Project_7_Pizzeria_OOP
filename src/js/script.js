/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 10,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  };


  class Product {
    constructor(id, data) {
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
    }

    renderInMenu() {
      const thisProduct = this;

      const generatedHTML = templates.menuProduct(thisProduct.data);          // generate HTML based on template
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);           // create element using utils.createElementFromHTML
      const menuContainer = document.querySelector(select.containerOf.menu);  // find menu container
      menuContainer.appendChild(thisProduct.element);                         // add element to menu
    }

    getElements() {
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }

    initAccordion() {
      const thisProduct = this;
      // const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable); /* find the clickable trigger (the element that should react to clicking) */

      thisProduct.accordionTrigger.addEventListener('click', function (event) {                  /* START: add event listener to clickable trigger on event click */
        event.preventDefault();                                                                 /* prevent default action for event */
        const activeProduct = document.querySelector(select.all.menuProductsActive);            /* find active product (product that has active class) */

        if (activeProduct != null && activeProduct != thisProduct.element) {                    /* if there is active product and it's not thisProduct.element, remove class active from it */
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
        }
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);             /* toggle active class on thisProduct.element */
      });
    }

    initOrderForm() {
      const thisProduct = this;
      thisProduct.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });

      for (let input of thisProduct.formInputs) {
        input.addEventListener('change', function () {
          thisProduct.processOrder();
        });
      }
      thisProduct.cartButton.addEventListener('click', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }

    processOrder() {
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.form);           // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      let price = thisProduct.data.price;                                       // set price to default price

      for (let paramId in thisProduct.data.params) {                             // for every category (param)...
        const param = thisProduct.data.params[paramId];                          // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }

        for (let optionId in param.options) {                                     // for every option in this category
          const option = param.options[optionId];                                 // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
          if (optionSelected) {                                                   // check if there is param with a name of paramId in formData and if it includes optionId
            if (option.default != true) {                                         // check if the option is not default
              price = price + option.price;                                       // add option price to price variable
            }
            else {
              if (option.default == true) {                                        // check if the option is default
                price = price - option.price;                                      // reduce price variable
              }
            }
          }
          const classImg = '.' + paramId + '-' + optionId;                        //[IMG] Find/build  image with class  .paramId-optionId 
          let optionImage = thisProduct.imageWrapper.querySelector(classImg);
          if (optionImage != null) {                                               //[IMG] If found
            if (optionSelected) {                                                  //[IMG] If option selected
              optionImage.classList.add(classNames.menuProduct.imageVisible);      //[IMG] Add class active to show img
            }
            else {                                                                 // [IMG] If not selected remove class active to hide img
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }
      }
      thisProduct.priceSingle = price;                                           // assignes value of price to object thisProduct with property price single (this property is created by linking with object)
      price *= thisProduct.amountWidget.value;                                   // multiply
      thisProduct.priceElem.innerHTML = price;                                   // update calculated price in the HTML
    }

    initAmountWidget() {
      const thisProduct = this;
      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

      thisProduct.amountWidgetElem.addEventListener('updated', function () {      // event fully defined by developer , hence no net to prevent default action as it doesent exist
        thisProduct.processOrder();
      });
    }

    addToCart() {
      const thisProduct = this;
      app.cart.add(thisProduct.prepareCartProduct());
    }

    prepareCartProduct() {
      const thisProduct = this;
      const productSummary = {
        id: thisProduct.id,
        name: thisProduct.data.name,
        amount: thisProduct.amountWidget.value,
        priceSingle: thisProduct.priceSingle,
        price: thisProduct.priceSingle * thisProduct.amountWidget.value,
        params: thisProduct.prepareCartProductParams(),
      };
      return productSummary;
    }

    prepareCartProductParams() {
      const thisProduct = this;

      const formData = utils.serializeFormToObject(thisProduct.form);           // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const params = {};

      for (let paramId in thisProduct.data.params) {                            // for every category (param)...
        const param = thisProduct.data.params[paramId];                         // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        params[paramId] = { label: param.label, options: {} };                  // !!!! create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}

        for (let optionId in param.options) {                                    // for every option in this category
          const option = param.options[optionId];                               // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
          if (optionSelected) {                                                 // check if there is param with a name of paramId in formData and if it includes optionId
            params[paramId].options[optionId] = option.label;                    // !!! option is selected!
          }
        }
      }
      return params;
    }
  }

  class AmountWidget {
    constructor(element) {
      const thisWidget = this;

      thisWidget.getElements(element);
      thisWidget.setValue(settings.amountWidget.defaultValue);
      thisWidget.initActions();
    }

    getElements(element) {
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value) {
      const thisWidget = this;
      const newValue = parseInt(value);

      if (thisWidget.value
        !== newValue && !isNaN(newValue)
        && newValue >= settings.amountWidget.defaultMin
        && newValue <= settings.amountWidget.defaultMax) {                    // add validation
        thisWidget.value = newValue;
        thisWidget.announce();
      }

      thisWidget.input.value = thisWidget.value;                              // value prior to change , if incorrect validated by if resets to previous            
    }

    initActions() {
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function (event) {           // START: add event listener to value change  trigger on event chnage 
        event.preventDefault();
        thisWidget.setValue(thisWidget.input.value);
      });
      thisWidget.linkDecrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });
      thisWidget.linkIncrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });
    }
    announce() {
      const thisWidget = this;

      const event = new CustomEvent('updated', {
        bubbles: true
      });
      thisWidget.element.dispatchEvent(event);
    }
  }

  class Cart {
    constructor(element) {
      const thisCart = this;
      thisCart.products = [];

      thisCart.getElements(element);
      thisCart.initActions();
    }

    getElements(element) {
      const thisCart = this;
      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = element.querySelector(select.cart.productList);
      thisCart.dom.deliveryFee = element.querySelector(select.cart.deliveryFee);
      thisCart.dom.totalNumber = element.querySelector(select.cart.totalNumber);
      thisCart.dom.subtotalPrice = element.querySelector(select.cart.subtotalPrice);
      thisCart.dom.totalPrice = element.querySelectorAll(select.cart.totalPrice);
    }

    initActions() {
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function (event) {
        event.preventDefault();
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);             // toggle active class 
      });
      thisCart.dom.productList.addEventListener('updated', function () {
        thisCart.update();
      });


      // works until this 
      thisCart.dom.productList.addEventListener('remove', function () {
        thisCart.remove();
      });


    }

    add(menuProduct) {
      const thisCart = this;
      const generatedHTML = templates.cartProduct(menuProduct);                         // generate HTML based on cart product  template with product object with 
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);                      // create element using utils.createElementFromHTML
      thisCart.dom.productList.appendChild(generatedDOM);                               // add DOM element to thisCart.dom.productList
      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
      thisCart.update();
    }

    update() {
      const thisCart = this;
      const deliveryFee = settings.cart.defaultDeliveryFee;
      let totalNumber = 0;
      let subtotalPrice = 0;
      for (let product of thisCart.products) {
        totalNumber += product.amount;
        subtotalPrice += product.price;
      }
      if (totalNumber > 0) {
        thisCart.totalPrice = deliveryFee + subtotalPrice;
        thisCart.dom.deliveryFee.innerHTML = deliveryFee;
        thisCart.dom.totalNumber.innerHTML = totalNumber;
        thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
      }

      for (let priceElemInArray of thisCart.dom.totalPrice) {
        priceElemInArray.innerHTML = thisCart.totalPrice;
      }
      // thisCart.dom.totalPrice[0].innerHTML = thisCart.totalPrice;     // !!!! Czy moge zaadresowac dwa welmenty tabilicy w jednum prypisaniu?!
      // thisCart.dom.totalPrice[1].innerHTML = thisCart.totalPrice;

    }
  }

  class CartProduct {

    constructor(menuProduct, element) {
      const thisCartProduct = this;
      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.params = menuProduct.params;

      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();
    }

    getElements(element) {
      const thisCartProduct = this;
      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = element.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = element.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = element.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = element.querySelector(select.cartProduct.remove);
    }

    initAmountWidget() {
      const thisCartProduct = this;
      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);

      thisCartProduct.dom.amountWidget.addEventListener('updated', function () {               // event fully defined by developer , hence no net to prevent default action as it doesent exist
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price = thisCartProduct.amount * thisCartProduct.priceSingle;
        thisCartProduct.dom.price.innerHTML = thisCartProduct.amount * thisCartProduct.priceSingle;
      });
    }

    remove() {
      const thisCartProduct = this;

      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });
      thisCartProduct.dom.wrapper.dispatchEvent(event);
    }

    initActions() {
      const thisCartProduct = this;

      thisCartProduct.dom.edit.addEventListener('click', function (event) {
        event.preventDefault();
      });
      thisCartProduct.dom.remove.addEventListener('click', function (event) {
        event.preventDefault();
        thisCartProduct.remove();
        console.log('dupa', thisCartProduct.remove);
      });
    }
  }

  const app = {
    initMenu() {
      const thisApp = this;

      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);                   // interuje po zestawie parametrow obiektu, iteruje jak po tablicy i podstawia zmienna pod [productData]
      }
    },

    initData: function () {
      const thisApp = this;

      thisApp.data = dataSource;                                                        // "." odwolanie do klucza albo wlasciwosci  w obiekcie
    },

    initCart: function () {
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },

    init: function () {
      const thisApp = this;

      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },
  };

  app.init();

}
