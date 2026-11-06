module.exports=function(js){
 const replace=(a,b)=>{if(!js.includes(a))throw Error('Button icon anchor missing');js=js.replace(a,b)};
 replace('jc,{value:"keyboard",children:c("hotkeys.keyboard")','jc,{value:"keyboard",icon:z.jsx(FssSettingsIcon,{name:"hotkeys"}),children:c("hotkeys.keyboard")');
 replace('jc,{value:"gamepad",children:c("hotkeys.gamepad")','jc,{value:"gamepad",icon:z.jsx(FssGamepadIcon,{}),children:c("hotkeys.gamepad")');
 replace('Ht,{appearance:"secondary",onClick:r,children:l("notifications.test")','Ht,{appearance:"secondary",icon:z.jsx(FssNotificationIcon,{}),onClick:r,children:l("notifications.test")');
 return js+`\nfunction FssGamepadIcon(){return z.jsx("svg",{width:20,height:20,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:1.6,strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":true,children:z.jsx("path",{d:"M7 6h10c3 0 4 3 5 10 0 3-3 3-5 0H7c-2 3-5 3-5 0C3 9 4 6 7 6ZM6 10v4M4 12h4M16 11h.01M19 13h.01"})})}function FssNotificationIcon(){return z.jsx("svg",{width:20,height:20,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:1.6,strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":true,children:z.jsx("path",{d:"M6 9a6 6 0 0 1 12 0v5l2 3H4l2-3ZM10 21h4M12 1v2"})})}\n`;
};
