import React from 'react';
import {createRoot} from 'react-dom/client';
import {View} from 'react-native';
import {useFonts} from 'expo-font';
import {SafeAreaProvider,SafeAreaInsetsContext} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {GluestackUIProvider} from '@/components/ui/gluestack-ui-provider';
import Drawer from '@/app/(no-layout)/(cashier)/cash-drawer';
import Layout from '@/app/(no-layout)/(cashier)/_layout';
import PublishedMenu from '@/components/feature/cashier-home/MainMenu';
import HeldDraftMenu from '../before/MainMenu';
import Footer from '@/components/common/BottomActionButton';
import BaselineFooter from '../before/components/common/BottomActionButton';
function Preview(){
 const fixture=globalThis.__pmDrawer;const [,refresh]=React.useState(0);globalThis.__pmRefresh=()=>refresh(n=>n+1);
 const [loaded]=useFonts({InterRegular:require('@/assets/fonts/Inter_24pt-Regular.ttf'),InterMedium:require('@/assets/fonts/Inter_24pt-Medium.ttf'),InterSemiBold:require('@/assets/fonts/Inter_24pt-SemiBold.ttf'),InterBold:require('@/assets/fonts/Inter_24pt-Bold.ttf'),Entypo:require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Entypo.ttf'),Feather:require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Feather.ttf')});if(!loaded)return null;
 const Menu=fixture.mode==='draft-menu'?HeldDraftMenu:PublishedMenu;
 const content=fixture.mode.endsWith('menu')?<Menu/>:fixture.mode==='footer-lab'?<><View testID="baseline-footer" style={{flex:1}}><BaselineFooter {...fixture.footerProps} onPress={()=>fixture.routes.push({action:'baseline-footer'})}>Baseline action</BaselineFooter></View><View testID="candidate-footer" style={{flex:1}}><Footer {...fixture.footerProps} onPress={()=>fixture.routes.push({action:'candidate-footer'})}>Candidate action</Footer></View></>:<><Layout/><Drawer/></>;
 return <GestureHandlerRootView style={{flex:1}}><SafeAreaProvider><SafeAreaInsetsContext.Provider value={fixture.insets}><GluestackUIProvider mode="light"><View testID="fixture-ready" style={{flex:1}}>{content}</View></GluestackUIProvider></SafeAreaInsetsContext.Provider></SafeAreaProvider></GestureHandlerRootView>;
}
createRoot(document.getElementById('root')).render(<Preview/>);
