import React from 'react';
import {
  IngredientCard,
  type IngredientCardProps,
} from '@/shared/components';

export type IngredientListItemProps = IngredientCardProps;

export function IngredientListItem(props: IngredientListItemProps) {
  return <IngredientCard {...props} />;
}

export default IngredientListItem;
