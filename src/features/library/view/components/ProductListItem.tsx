import React from 'react';
import {
  ProductCard,
  type ProductCardProps,
} from '@/shared/components';
import { ProductListItemModel } from '../../model/library_types';

export interface ProductListItemProps {
  item: ProductListItemModel;
  isFavoriteDisabled: boolean;
  onPress: (productId: string) => void;
  onFavoritePress: (productId: string) => void;
  className?: string;
}

export function ProductListItem(props: ProductListItemProps) {
  return <ProductCard {...props} />;
}

export default ProductListItem;
