// Frame the detected country as the background, with space on the left for text.
export function countryFrame({x,y,width,height}, viewportWidth, viewportHeight) {
  const aspect=Math.max(.3,viewportWidth/Math.max(1,viewportHeight));
  const countryWidth=width > 450 ? 70 : width;
  const viewHeight=Math.max(110, Math.min(270, Math.max(height*2.2,countryWidth*1.9/aspect)));
  const viewWidth=viewHeight*aspect;
  return {x:x-viewWidth*(aspect>1 ? .72 : .5),y:y-viewHeight*(aspect>1 ? .54 : .38),width:viewWidth,height:viewHeight};
}
export function worldFrame(viewportWidth,viewportHeight) {
  const aspect=Math.max(.3,viewportWidth/Math.max(1,viewportHeight));
  const width=Math.max(900,370*aspect),height=width/aspect;
  return {x:450-width/2,y:185-height/2,width,height};
}
