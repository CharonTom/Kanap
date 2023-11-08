/**
 * Cette fonction récupère le numéro de commande dans l'url et l'affiche dans le DOM
 * Elle envoie également un message de remerciement
 */
function getOrderId() {
    const orderId = document.getElementById('orderId'); 
    const url = new URL(window.location.href); 
    orderId.innerText = url.searchParams.get("id");
    alert('Nous vous remercions d\'avoir fait vos courses chez KANAP !\nVeuillez prendre note de votre numéro de commande')
};
getOrderId();
