/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
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
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
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
      thisProduct.processOrder();
    }

    renderInMenu(){
      const thisProduct = this;
      
      const generatedHTML = templates.menuProduct(thisProduct.data);          // generate HTML based on template
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);           // create element using utils.createElementFromHTML
      const menuContainer = document.querySelector(select.containerOf.menu);  // find menu container
      menuContainer.appendChild(thisProduct.element);                         // add element to menu
    }

    getElements(){
      const thisProduct = this;
    
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    }

    initAccordion(){
      const thisProduct = this;
      // const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable); /* find the clickable trigger (the element that should react to clicking) */
      
      thisProduct.accordionTrigger.addEventListener('click', function(event) {                  /* START: add event listener to clickable trigger on event click */
        event.preventDefault();                                                                 /* prevent default action for event */
        const activeProduct = document.querySelector(select.all.menuProductsActive);            /* find active product (product that has active class) */
        
        if (activeProduct != null && activeProduct != thisProduct.element) {                    /* if there is active product and it's not thisProduct.element, remove class active from it */
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
        }
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);             /* toggle active class on thisProduct.element */
      });
    }

    initOrderForm(){
      const thisProduct = this;
      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
      
      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }
      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
    }

    processOrder(){
      const thisProduct = this; 
      const formData = utils.serializeFormToObject(thisProduct.form);         // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      let price = thisProduct.data.price;                                     // set price to default price

      for(let paramId in thisProduct.data.params) {                           // for every category (param)...
        const param = thisProduct.data.params[paramId];                       // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        
        for(let optionId in param.options) {                                  // for every option in this category
          const option = param.options[optionId];                             // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
          if(optionSelected) {                                                // check if there is param with a name of paramId in formData and if it includes optionId
            if(option.default != true) {                                      // check if the option is not default
              price = price + option.price;                                   // add option price to price variable
            }
            else {
              if(option.default == true) {                                    // check if the option is default
                price = price - option.price;                                 // reduce price variable
              }
            }
          }
          const classImg = '.' + paramId + '-' + optionId;                       //[IMG] Find/build  image with class  .paramId-optionId 
          let optionImage = thisProduct.imageWrapper.querySelector(classImg);      
          if (optionImage != null) {                                             //[IMG] If found
            if(optionSelected) {                                                 //[IMG] If option selected
              optionImage.classList.add(classNames.menuProduct.imageVisible);    //[IMG] Add class active to show img
            }
            else {                                                               // [IMG] If not selected remove class active to hide img
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }
          } 
        }
      }
      thisProduct.priceElem.innerHTML = price;                                   // update calculated price in the HTML
    }
  }

  const app = {
    initMenu (){
      const thisApp = this;
      console.log('thisApp.data:', thisApp.data);

      for(let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);           // interuje po zestawie parametrow obiektu, iteruje jak po tablicy i podstawia zmienna pod [productData]
      }
    },

    initData: function(){
      const thisApp = this;

      thisApp.data = dataSource;                                              // "." odwolanie do klucza albo wlasciwosci  w obiekcie
    },
    
    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
 
}
