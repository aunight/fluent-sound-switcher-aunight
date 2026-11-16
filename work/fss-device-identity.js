async function FssRepairDevices(store){
 const devices=await te("list_audio_devices"),known=await store.get("deviceIdentity")||{},aliases=await store.get("deviceAliases")||{},ids=new Set(devices.map(d=>d.id)),map={};
 for(const [id,identity]of Object.entries(known)){if(ids.has(id))continue;const candidates=devices.filter(d=>d.direction===identity.direction&&d.name===identity.name);if(candidates.length===1)map[id]=candidates[0].id;}
 const favorites=await store.get("favorites"),order=await store.get("deviceOrder");
 if(Object.keys(map).length){const backup=await Mc.load("device-preferences-backup.json",{autoSave:false});await backup.set(String(Date.now()),{favorites,deviceOrder:order,deviceAliases:aliases,deviceIdentity:known});await backup.save();
 for(const [key,value]of [["favorites",favorites],["deviceOrder",order]])if(value){const next={};for(const flow of ["input","output"])next[flow]=[...new Set((value[flow]||[]).map(id=>map[id]||id))];await store.set(key,next);}
 for(const [old,id]of Object.entries(map))if(aliases[old]&&!aliases[id])aliases[id]=aliases[old];await store.set("deviceAliases",aliases);}
 for(const d of devices)known[d.id]={name:d.name,direction:d.direction};await store.set("deviceIdentity",known);await store.save();
}
