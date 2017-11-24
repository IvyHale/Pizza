/**
 * Created by chaika on 02.02.16.
 */
var Templates = require('../Templates');
var localStorage = require('../localStorage.js');

//Перелік розмірів піци
var PizzaSize = {
    Big: "big_size",
    Small: "small_size"
};

var Cart = [];  //Змінна в якій зберігаються перелік піц в кошику
var sum=0;
var $cart = $("#cart"); //HTML едемент куди будуть додаватися піци

function addToCart(pizza, size) {

    if(labelPresent(pizza, size)){
        incrementQuantity(pizza, size);
    } else {
        Cart.push({
            pizza: pizza,
            size: size,
            price: pizza[size].price,
            quantity: 1
        });
    } 

    incrementTotalCost(pizza[size].price);
    
    //Оновити вміст кошика на сторінці
    redrawCart();
}

function removeFromCart(cart_item) {
    //Видалити піцу з кошика
    Cart.splice(Cart.indexOf(cart_item), 1);

    incrementTotalCost(- cart_item.pizza[cart_item.size].price * cart_item.quantity );

    //Після видалення оновити відображення
    redrawCart();
}

function incrementTotalCost(cost_change){
    quantity_node = $('#order-sum-bottom');
    var curr_sum = sum;
    var new_sum =  curr_sum + cost_change;

    if(new_sum < 0){
        console.error('total order cost is < 0!')
        quantity_node.text(0);
        sum=0;

    } else {

        quantity_node.text(new_sum);
    }

    sum=new_sum;
    // alert(sum);
    checkSum();

}

function checkSum(){
    if(sum<=0){
        $('.r3 span').css('display','none');
        $('.button-order').prop('disabled', true);
    }
    else{
        $('.r3 span').css('display','inline-block');
        $('.button-order').prop('disabled', false);
    }
}

function labelPresent(pizza, size) {
    var res = false;
    Cart.forEach( function(element) {
        if(element.pizza.title == pizza.title && element.size == size){
            res =  true;
        }
    });
    return res; 
}

function incrementQuantity(pizza, size){
    Cart.forEach(function(element) {
        if(element.pizza.title && element.size == size){
            element.quantity += 1;
            element.price += element.pizza[element.size].price;
        }
    });
    redrawCart();
}

function sizeToString(size){
    switch(size){
        case PizzaSize.Big:
            return "Велика";

        case PizzaSize.Small:
            return "Мала";

        default:
            console.error("Can't stringify size - passed argument is not of type PizzaSize");
    }
}

function initialiseCart() {
    //Фукнція віпрацьвуватиме при завантаженні сторінки
    //Тут можна наприклад, зчитати вміст корзини який збережено в Local Storage то показати його
    
    var saved_cart = localStorage.get('cart');
    var saved_sum = localStorage.get('sum');

    if(saved_cart){
        Cart = saved_cart;
        sum=saved_sum;
    }

    window.onbeforeunload = function() {
        localStorage.set('cart', Cart);
        localStorage.set('sum', sum);
    };

    $('span.clear-order').click(function() {
        Cart = [];
        sum=0;
        redrawCart();
    });
    redrawCart();

}

function getCart() {
    //Повертає піци які зберігаються в кошику
    return Cart;
}

function redrawCart() {
    //Функція викликається при зміні вмісту кошика
    //Тут можна наприклад показати оновлений кошик на екрані та зберегти вміст кошика в Local Storage
    //Очищаємо старі піци в кошику
    $cart.html("");

    $('#order-sum').text(Cart.length);
    $('#order-sum-bottom').text(sum+" грн.");
    checkSum();
    //Оновлення однієї піци
    function drawPizzaInCart(cart_item) {
        var ejs_compatible_cart_item = {
            pizza : cart_item.pizza,
            size : cart_item.size,
            size_string : sizeToString(cart_item.size),
            quantity : cart_item.quantity,
            price:cart_item.price
        };

        var html_code = Templates.PizzaCart_OneItem(ejs_compatible_cart_item);
    

        var $node = $(html_code);

        if($(".order-page")[0]){
            $node.find(".minus").css("display","none");
            $node.find(".plus").css("display","none");
            $node.find(".cart-delete").css("display","none");

        }
        else {
            $node.find(".plus").click(function () {
                //Збільшуємо кількість замовлених піц
                cart_item.quantity += 1;
                cart_item.price += cart_item.pizza[cart_item.size].price;

                incrementTotalCost(cart_item.pizza[cart_item.size].price);

                //Оновлюємо відображення
                redrawCart();
            });
            $node.find(".minus").click(function () {
                var currQuantity = cart_item.quantity;

                if(currQuantity > 1){
                    cart_item.quantity -= 1;
                    cart_item.price -= cart_item.pizza[cart_item.size].price;

                    incrementTotalCost(- cart_item.pizza[cart_item.size].price);

                    //Оновлюємо відображення
                    redrawCart();
                } else {
                    removeFromCart(cart_item);
                }
            });
            $node.find(".cart-delete").click(function () {
                removeFromCart(cart_item);
                redrawCart();
            });
        }


        $cart.append($node);
    }
    
    Cart.forEach(drawPizzaInCart);
}

exports.removeFromCart = removeFromCart;
exports.addToCart = addToCart;

exports.getPizzaInCart = getCart;
exports.initialiseCart = initialiseCart;

exports.PizzaSize = PizzaSize;