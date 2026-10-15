export function activeEvents(events,beat){return events.filter(e=>e.beat<=beat&&beat<e.beat+e.duration);}
export function advanceBeat(beat,seconds,bpm,speed,end,loop){let next=beat+seconds*bpm/60*speed;let wrapped=false;if(loop&&next>=loop.b){next=loop.a+(next-loop.b)%(loop.b-loop.a);wrapped=true;}return {beat:Math.min(next,end),ended:!loop&&next>=end,wrapped};}
