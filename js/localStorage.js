/**
 * La fonction saveCart() utilise la méthode setItem() avec un duo clé-valeur
 * Elle les ajoute dans le local storage, si la clé existe déjà elle met à jour la valeur
 * @param {string} Cart 
 */
function saveCart(Cart) {
    localStorage.setItem("MyKanapCart", JSON.stringify(Cart));
}


/**
 * La fonction getCart() utilise la méthode getItem() qui récupère la valeur associée à la clé
 * Je récupère donc le contenu du panier nommé MyKanapCart 
 * @returns si le panier est null un tableau vide est retourné, sinon on récupère son contenu
 */
function getCart() {
    let Cart = localStorage.getItem("MyKanapCart");

    if (Cart == null) {
        return [];
    } else {
        return JSON.parse(Cart);
    }
}


/**
 * Permet d'ajouter un produit dans le panier
 * on récupère les valeurs du local storage et on les met dans la variable Cart
 * On parcours ces valeurs et si le produit ajouté existe déjà, les quantités s'additionnent
 * Sinon on récupère les données du produit ajouté et on les met dans le Local Storage
 * @param {string} _id 
 * @param {number} quantity 
 */
function addCart(_id, quantity) {
    let Cart = getCart();
    const Index = Cart.findIndex(p => p.id === _id);
    if (Index !== -1) {
        Cart[Index].quantity += quantity;
    } else {
        const product = {
            id: _id,
            quantity: quantity,
            name: title.textContent,
            color: colors.value,
            imgurl: imgurl,
            alttxt: alttxt
        }
        Cart.push(product);
    }
    saveCart(Cart); // On sauvegarde le panier
}


/**
 * Supprime un article du panier
 * @param {string} _id 
 */
function removeFromCart(_id) {
    let Cart = getCart();
    Cart = Cart.filter(p => p.id != _id);
    saveCart(Cart);
}


/**
 * Change la quantité d'un produit
 * @param {string} _id 
 * @param {number} quantity 
 */
function changeQuantity(_id, quantity) {
    let Cart = getCart();
    let foundProduct = Cart.find(
        p => p.id == _id
    );
    if (foundProduct != undefined) {
        foundProduct.quantity = quantity;
        if (foundProduct.quantity <= 0) {
            removeFromCart(foundProduct);
        }
        else {
            saveCart(Cart);
        }
    }
}


/**
 * Cette fonction permet de récupérer la quantité d'un id du local storage lorsque elle est appellée
 * @param {string} _id 
 * @returns Si l'id est dans le local storage je retourne sa quantité sinon je retourne -1
 */
function getQuantity(_id) {
    let Cart = getCart();
    let foundProduct = Cart.find(
        p => p.id == _id
    );
    if (foundProduct != undefined) {
        return foundProduct.quantity;
    }
    return -1;
}


/**
 * La fonction getNumberOfProduct relève la quantité des produits dans le localStorage et les affiches dans la page Panier 
 */
function getNumberProduct() {
    let number = 0;
    let Cart = getCart();

    for (let product of Cart) {
        number += product.quantity;
    }
    return number;
}