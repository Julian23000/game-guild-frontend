// import React from 'react';
// import { View, Text, StyleSheet, Image } from 'react-native';

// export default function FriendProgress({ data }) {
//   return (
//     <View style={styles.card}>
//       <Text style={styles.name}>{data.name} has made progress in:</Text>
//       <Text style={styles.game}>{data.game}</Text>
//       <View style={styles.progressBar}>
//         <View style={[styles.progressFill, { width: `${data.progress}%` }]} />
//       </View>
//       <Text style={styles.percent}>{data.progress}% achievements</Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   card: {
//     backgroundColor: '#1e1e1e',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//   },
//   name: { color: '#fff', fontSize: 14, marginBottom: 6 },
//   game: { color: '#a3a3a3', fontSize: 16, marginBottom: 10 },
//   progressBar: {
//     height: 8,
//     backgroundColor: '#333',
//     borderRadius: 4,
//     overflow: 'hidden',
//   },
//   progressFill: {
//     height: '100%',
//     backgroundColor: '#4ade80',
//   },
//   percent: {
//     color: '#bbb',
//     fontSize: 12,
//     marginTop: 6,
//     textAlign: 'right',
//   },
// });



import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export default function FriendProgress({ data }) {
  const images = {
    'gta v': 'https://upload.wikimedia.org/wikipedia/en/a/a5/Grand_Theft_Auto_V.png',
    'pubg: battlegrounds': 'https://upload.wikimedia.org/wikipedia/en/6/6e/PUBG_Box_cover.jpg',
    'gang beasts': 'https://upload.wikimedia.org/wikipedia/en/4/41/Gang_Beasts_cover_art.jpg',
  };

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Image
          source={{ uri: images[data.game.toLowerCase()] }}
          style={styles.gameImage}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{data.name} has made progress in:</Text>
          <Text style={styles.game}>{data.game}</Text>
        </View>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${data.progress}%` }]} />
      </View>
      <Text style={styles.percent}>his achievements are now at {data.progress}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  gameImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  name: {
    color: '#fff',
    fontSize: 14,
  },
  game: {
    color: '#a3a3a3',
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ade80',
  },
  percent: {
    color: '#bbb',
    fontSize: 12,
    marginTop: 6,
    textAlign: 'right',
  },
});
