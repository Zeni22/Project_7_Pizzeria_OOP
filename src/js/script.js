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
      thisProduct.initAccordion();
    }


    renderInMenu(){
      const thisProduct = this;
      
      const generatedHTML = templates.menuProduct(thisProduct.data);          // generate HTML based on template
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);           // create element using utils.createElementFromHTML
      const menuContainer = document.querySelector(select.containerOf.menu);  // find menu container
      menuContainer.appendChild(thisProduct.element);                         // add element to menu
    }


    initAccordion(){
      const thisProduct = this;
      const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable); /* find the clickable trigger (the element that should react to clicking) */
      
      clickableTrigger.addEventListener('click', function(event) {                              /* START: add event listener to clickable trigger on event click */
        event.preventDefault();                                                                 /* prevent default action for event */
        const activeProduct = document.querySelector(select.all.menuProductsActive);            /* find active product (product that has active class) */
        
        if (activeProduct != null && activeProduct != thisProduct.element) {                    /* if there is active product and it's not thisProduct.element, remove class active from it */
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
        }

        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);                                         /* toggle active class on thisProduct.element */
      });
    }
  }

  const app = {
    initMenu (){
      // const thisApp = this;
      // console.log('thisApp.data:', thisApp.data);
      // const testProduct = new Product();
      // console.log('testProduct:', testProduct);
      const thisApp = this;
      console.log('thisApp.data:', thisApp.data);

      for(let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]); // interuje po zestawie parametrow obiektu, iteruje jak po tablicy i podstawia zmienna pod [productData]
      }

    },

    initData: function(){
      const thisApp = this;

      thisApp.data = dataSource; // "." odwolanie do klucza albo wlasciwosci  w obiekcie
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
