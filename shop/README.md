# Mini Shop

A small product-listing page with a sliding cart sidebar.

## Stack
- **Backend:** Node.js + Express
- **Frontend:** Vanilla HTML / CSS / JavaScript (no build step)

## Endpoints
| Method | Path              | Description                            |
|--------|-------------------|----------------------------------------|
| GET    | `/api/products`   | List of 6 products                     |
| GET    | `/api/cart`       | Current cart: items, count, total      |
| POST   | `/api/cart/add`   | Body: `{ productId }` — add 1 of item  |
| POST   | `/api/cart/update`| Body: `{ productId, quantity }`        |
| POST   | `/api/cart/clear` | Empty the cart                         |

## Run

```bash
cd shop
npm install
npm start
```

Open <http://localhost:3001>.
