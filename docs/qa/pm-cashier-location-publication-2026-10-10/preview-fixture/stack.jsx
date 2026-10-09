import React from 'react';
export function JSStack({children}){const screen=React.Children.toArray(children).find(c=>c.props.name==='detail');if(!screen)throw Error('Actual Detail registration missing');return screen.props.options.header({route:{params:globalThis.__pmLocation.params}});}
JSStack.Screen=()=>null;export const ScaleBackTransition={};
