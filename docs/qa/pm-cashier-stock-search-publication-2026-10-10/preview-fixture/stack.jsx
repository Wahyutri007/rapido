import React from 'react';
export function JSStack({children}){const name=globalThis.__pmStock.mode==='printer'?'index':'stock',screen=React.Children.toArray(children).find(child=>child.props.name===name);if(!screen)throw Error('Missing actual Stock/Printer registration');return screen.props.options.header();}
JSStack.Screen=()=>null;
export const ScaleBackTransition={};
