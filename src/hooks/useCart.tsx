import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart')

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      // TODO
      const response = await api(`/products/${productId}`)
      const product: Product = await response.data

      if (!response.data)
        throw Error

      const cartProduct = cart.find((product) => product.id === productId)

      // verifica se existe um produto com mesmo id no carrinho
      if (cartProduct) {
        updateProductAmount({
          productId: productId,
          amount: cartProduct.amount + 1
        })

        return
      }

      // caso nao exista, copia o carrinho e adiciona uma quantidade do novo produto
      const updatedCart = [...cart, {
        id: productId,
        amount: 1,
        image: product.image,
        price: product.price,
        title: product.title
      }]

      setCart(updatedCart)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))
    } catch {
      // TODO
      toast.error('Erro na adição do produto')
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
      const updatedCart = [...cart]
      const productIndex = updatedCart.findIndex(product => productId === product.id)

      if (productIndex <= 0) throw Error()

      updatedCart.splice(productIndex, 1)

      setCart(updatedCart)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))
    } catch {
      // TODO
      toast.error('Erro na remoção do produto')
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {

    if (amount <= 0)
      return

    try {
      // TODO
      // informações do estoque
      const stockResponse = await api(`/stock/${productId}`)
      const productStock = await stockResponse.data

      if (!productStock) throw Error()

      // Se nao tiver produto no estoque ou se a quantidade ja é igual a do estoque, joga erro
      if (amount > productStock.amount) {
        toast.error("Quantidade solicitada fora de estoque")
        return;
      }

      const updatedCart = cart.map((product: Product) => {
        if (product.id === productId) {
          product.amount = amount
        }

        return product
      })


      setCart(updatedCart)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))


    } catch {
      // TODO
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
