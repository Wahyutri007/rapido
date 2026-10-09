import React from 'react';
export function JSStack({children}){const screen=React.Children.toArray(children).find(child=>child.props.name==='cash-drawer');if(!screen)throw Error('Missing actual CashDrawer registration');return screen.props.options.header();}
JSStack.Screen=()=>null;
export const ScaleBackTransition={};
