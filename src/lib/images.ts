/**
 * Photo pool. Pexels CDN ids, grouped by what the photo actually shows so a
 * listing's gallery reads like one property rather than a random shuffle.
 */
const px = (id: number, w = 1200) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`

export const EXTERIORS = [
  323780, 106399, 1396122, 186077, 221540, 164558, 280229, 1029599, 2102587, 210538, 208736, 1438832,
  1370704, 259588, 7031406, 7061662, 1643389,
].map((id) => px(id))

export const LIVING = [
  1643383, 2029667, 276724, 1571453, 1571460, 1571468, 1668860, 2251247, 271624, 276534, 276583,
  4857775, 6316065, 1457842, 2635038,
].map((id) => px(id))

export const KITCHENS = [1080721, 2724749, 1080696, 1643384, 1648776, 2062426].map((id) => px(id))

export const BEDROOMS = [1454806, 2881232, 1866149].map((id) => px(id))

export const BATHROOMS = [1457847, 3315291].map((id) => px(id))

export const AVATARS = [2381069, 3760263, 1181424, 936119, 1181519, 428364, 1181690, 774909].map((id) =>
  px(id, 320),
)

/** Build a coherent gallery: exterior first, then the rooms. */
export function gallery(seed: number, rooms = 6) {
  const pick = <T,>(arr: T[], offset: number) => arr[(seed + offset) % arr.length]
  const out = [
    pick(EXTERIORS, 0),
    pick(LIVING, 1),
    pick(KITCHENS, 2),
    pick(BEDROOMS, 3),
    pick(LIVING, 5),
    pick(BATHROOMS, 1),
    pick(EXTERIORS, 7),
    pick(LIVING, 9),
  ]
  return out.slice(0, rooms)
}
