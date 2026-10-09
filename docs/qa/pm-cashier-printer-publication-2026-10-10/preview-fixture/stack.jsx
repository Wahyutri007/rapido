import React from 'react';
export function JSStack({children}){const name=globalThis.__pmPrinter.mode==='modify'?'modify':'index',screen=React.Children.toArray(children).find(child=>child.props.name===name);if(!screen)throw Error('Missing actual Printer registration');return screen.props.options.header();}
JSStack.Screen=()=>null;
export const ScaleBackTransition={};
