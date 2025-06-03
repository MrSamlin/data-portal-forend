 
 
 export const getPrefixedImageUrl = (iconPath: string | null | undefined): string => {
  if (!iconPath) {
    return ''; // Or return a placeholder image URL if you have one
  }
  let prefixUrl='';
  if(process.env.NODE_ENV === 'production'){
   // prefixUrl='https://ia.cmfchina.com/cmfwxrobot/';
   prefixUrl='https://iadev.cmfchina.com/cmfwxrobot/';
  }  
  // Ensure there's exactly one leading slash for the joined path part
  return `${prefixUrl}${iconPath}`;
};  