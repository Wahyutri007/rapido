import React, { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ScrollView, View } from 'react-native';
import { SafeAreaFrameContext, SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import BottomActionBar, { BottomActionInset } from '../../../components/common/BottomActionBar';
import Wrapper from '../../../components/common/Wrapper';
import AnimatedWrapper from '../../../components/common/AnimatedWrapper';
import Text from '../../../components/common/Text';
import ReportActionButton from '../../../components/feature/reports/ReportActionButton';
import { Button, ButtonText } from '../../../components/ui/button';
import { GluestackUIProvider } from '../../../components/ui/gluestack-ui-provider';

window.qcFooterCalls=[];
function Fixture(){
 const [config,setConfig]=useState({kind:'form',bottom:48,left:0,right:0,top:24});
 const [counter,setCounter]=useState(0);const instance=useRef(Math.random().toString(36));
 const [fonts]=useFonts({InterRegular:require('../../../assets/fonts/Inter_24pt-Regular.ttf'),InterMedium:require('../../../assets/fonts/Inter_24pt-Medium.ttf'),InterSemiBold:require('../../../assets/fonts/Inter_24pt-SemiBold.ttf'),InterBold:require('../../../assets/fonts/Inter_24pt-Bold.ttf')});
 window.qcSetFooter=(next)=>setConfig(old=>({...old,...next}));
 const mark=kind=>{window.qcFooterCalls.push(kind);setCounter(n=>n+1);};
 const {kind,bottom,left,right,top}=config;
 const content=<><Text testID="first-field">Awal formulir contoh</Text>{Array.from({length:25},(_,i)=><View key={i} style={{height:52,justifyContent:'center'}}><Text>Kolom contoh {i+1}</Text></View>)}<View testID="last-field" style={{height:52,justifyContent:'center',backgroundColor:'#edf6ff'}}><Text>Field terakhir</Text></View></>;
 const button=(label='Simpan',props={})=><Button size="xl" {...props} onPress={()=>mark(label)}><ButtonText>{label}</ButtonText></Button>;
 let scroll;
 if(kind==='manual100'||kind==='manual110')scroll=<ScrollView testID="content-scroll" contentContainerStyle={{padding:16,paddingBottom:kind==='manual100'?100:110,gap:16}}>{content}<BottomActionInset/></ScrollView>;
 else if(kind==='animated'||kind==='report')scroll=<AnimatedWrapper testID="content-scroll" hasActionButton={kind==='animated'} hasBottomBar={kind==='report'} showScrollToTopFab={false} contentContainerStyle={{padding:16,gap:16}}>{content}</AnimatedWrapper>;
 else scroll=<Wrapper testID="content-scroll" hasActionButton={kind==='form'||kind==='row'} hasBottomBar={false} contentContainerStyle={{padding:16,gap:16}}>{content}</Wrapper>;
 return <SafeAreaInsetsContext.Provider value={{top,bottom,left,right}}><SafeAreaFrameContext.Provider value={{x:0,y:0,width:window.innerWidth,height:window.innerHeight}}><GluestackUIProvider mode="light"><View style={{flex:1}} testID="preview-ready">
 {fonts&&<><View testID="instance" accessibilityLabel={instance.current} style={{height:0,overflow:'hidden'}}><Text>{counter}</Text></View>{scroll}
 {kind==='report'?<ReportActionButton label="Aksi laporan" onPress={()=>mark('report-open')} onOpenChange={value=>window.qcFooterCalls.push('report-state-'+value)}/>:kind==='standalone'?<View testID="standalone-holder" style={{position:'absolute',top:16,left:16,right:16}}><ReportActionButton standalone label="Aksi mandiri" onPress={()=>mark('standalone-open')}/></View>:kind==='none'?null:<BottomActionBar className={kind==='row'?'flex-row items-center gap-3':undefined}>{kind==='row'?<>{button('Edit',{className:'flex-1',variant:'outline'})}{button('Hapus',{className:'flex-1',action:'negative'})}</>:button()}</BottomActionBar>}
 <View pointerEvents="none" testID="system-bottom" style={{position:'absolute',bottom:0,left:0,right:0,height:bottom,backgroundColor:'rgba(205,30,30,0.18)'}}/>
 <View pointerEvents="none" testID="system-left" style={{position:'absolute',top:0,bottom:0,left:0,width:left,backgroundColor:'rgba(205,30,30,0.18)'}}/>
 <View pointerEvents="none" testID="system-right" style={{position:'absolute',top:0,bottom:0,right:0,width:right,backgroundColor:'rgba(205,30,30,0.18)'}}/>
 </>}
 </View></GluestackUIProvider></SafeAreaFrameContext.Provider></SafeAreaInsetsContext.Provider>;
}
createRoot(document.getElementById('root')).render(<Fixture/>);
