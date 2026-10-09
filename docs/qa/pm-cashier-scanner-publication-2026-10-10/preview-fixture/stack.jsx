import React from 'react';
export function JSStack({children}){
 const name=globalThis.__pmFixture.mode==='scanner-detail'?'detail':'index';
 const screen=React.Children.toArray(children).find(child=>child.props.name===name);
 if(!screen)throw Error('Missing actual Scanner layout registration '+name);
 return screen.props.options.header();
}
JSStack.Screen=()=>null;
export const ScaleBackTransition={};
