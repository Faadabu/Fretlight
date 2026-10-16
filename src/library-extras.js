export const repertoire = [
 ['Led Zeppelin','Stairway to Heaven','Intermediate','Arpeggios, chord changes, gradual dynamic build'],
 ['Led Zeppelin','Babe I’m Gonna Leave You','Intermediate','Fingerpicked accompaniment and strong dynamic contrast'],
 ['Led Zeppelin','Going to California','Advanced','Alternate tuning and independent melodic accompaniment'],
 ['Led Zeppelin','Black Mountain Side','Advanced','Alternate tuning, ornaments and rhythmic control'],
 ['Led Zeppelin','Bron-Yr-Aur','Advanced','Fingerstyle and alternate-tuning voicings'],
 ['Led Zeppelin','Whole Lotta Love','Intermediate','Riff timing, muting and rock phrasing'],
 ['Led Zeppelin','Kashmir','Advanced','Alternate tuning and layered rhythmic cycles'],
 ['Estas Tonne','The Song of the Golden Dragon','Advanced','Continuous arpeggios, rhythmic accents and long-form development'],
 ['Estas Tonne','Internal Flight','Performance','Sustained improvisation, pacing, tone and dynamic arcs'],
 ['The Beatles','Blackbird','Intermediate','Moving double-stops and independent bass'],
 ['Fleetwood Mac','Landslide','Intermediate','Steady fingerpicking under a vocal melody'],
 ['Kansas','Dust in the Wind','Intermediate','Alternating bass with treble picking'],
 ['Eric Clapton','Tears in Heaven','Advanced','Melody, bass and chord coordination'],
 ['Tommy Emmanuel','Classical Gas','Performance','Arrangement, articulation and sustained performance control']
].map(([artist,title,level,focus])=>({artist,title,level,focus}));

export function addTraditionalSongs(songs){
 const positions={C:[2,1],D:[2,3],E:[1,0],F:[1,1],G:[1,3],A:[1,5],B:[1,7],c:[1,8],g:[3,0]};
 const tunes=[
  ['twinkle','Twinkle, Twinkle, Little Star','C C G G A A G:2 F F E E D D C:2 G G F F E E D:2 G G F F E E D:2 C C G G A A G:2 F F E E D D C:2'],
  ['mary','Mary Had a Little Lamb','E D C D E E E:2 D D D:2 E G G:2 E D C D E E E E D D E D C:2'],
  ['frere','Frère Jacques','C D E C C D E C E F G:2 E F G:2 G:.5 A:.5 G:.5 F:.5 E C G:.5 A:.5 G:.5 F:.5 E C C g C:2 C g C:2'],
  ['london','London Bridge','G:1.5 A:.5 G F E F G:2 D E F:2 E F G:2 G:1.5 A:.5 G F E F G:2 D:2 G:2 E C:2'],
  ['hot-cross','Hot Cross Buns','E D C:2 E D C:2 C:.5 C:.5 C:.5 C:.5 D:.5 D:.5 D:.5 D:.5 E D C:2']
 ];
 for(const [id,title,melody] of tunes){let beat=0;const events=melody.split(' ').map(token=>{const [pitch,d]=token.split(':'),duration=Number(d||1),[string,fret]=positions[pitch];const event={beat,duration,notes:[{string,fret,...(fret===0?{finger:0}:{})}],direction:'down',label:pitch.toUpperCase()};beat+=duration;return event;});songs.push({id:'traditional-'+id,title,genre:'folk',level:'Beginner',description:'Public-domain traditional melody · original single-note guitar arrangement.',bpm:60,meter:4,events});}
}
