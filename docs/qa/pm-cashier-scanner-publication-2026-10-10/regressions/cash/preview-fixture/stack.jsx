import React from "react";
export function JSStack({children}){return React.Children.toArray(children).find(child=>child.props.name==='input-money').props.options.header();}
JSStack.Screen=()=>null;
export const ScaleBackTransition={};
