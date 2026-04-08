import { Order } from '../app/@shared/interfaces/order';

export const order: Order = {
    id: 3857,
    date: '19 October, 2020',
    status: 'On hold',
    items: [
        {
            id: 1,
            slug: 'electric-planer-brandix-kl370090g-300-watts',
            name: 'Electric Planer Brandix KL370090G 300 Watts',
            image: 'assets/images/products/product-1.jpg',
            options: [
                {
                    label: 'Color',
                    value: 'Yellow',
                },
                {
                    label: 'Material',
                    value: 'Aluminium',
                },
            ],
            price: 0,
            quantity: 1,
            total: 0,
        },
        {
            id: 2,
            slug: 'undefined-tool-iradix-dps3000sy-2700-watts',
            name: 'Undefined Tool IRadix DPS3000SY 2700 Watts',
            image: 'assets/images/products/product-2.jpg',
            price: 0,
            quantity: 1,
            total: 0,
        },
    ],
    additionalLines: [
        {
            label: 'Data Marketplace Credit',
            total: 0,
        },
        {
            label: 'Shipping',
            total: 0,
        },
    ],
    quantity: 2,
    subtotal: 0,
    total: 0,
    paymentMethod: 'Cost Center',
    shippingAddress: {
        firstName: 'Helena',
        lastName: 'Garcia',
        email: 'stroyka@example.com',
        phone: '38 972 588-42-36',
        country: 'Random Federation',
        city: 'Moscow',
        postcode: '115302',
        address: 'ul. Varshavskaya, 15-2-178'
    },
    billingAddress: {
        firstName: 'Jupiter',
        lastName: 'Saturnov',
        email: 'stroyka@example.com',
        phone: 'ZX 971 972-57-26',
        country: 'RandomLand',
        city: 'MarsGrad',
        postcode: '4b4f53',
        address: 'Sun Orbit, 43.3241-85.239'
    },
};
