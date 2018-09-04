/*
 Minimal 2d polygonSelfIntersect geometry helper function
 I wrote this one mainly to be used while a user digitize a polygon in openlayers
 to check if a new point can be considered valid and accepted
 code is inspired by work and informations found on :
 1) article from Martin Thoma available here : https://martin-thoma.com/how-to-check-if-two-line-segments-intersect/
 2) https://algs4.cs.princeton.edu/91primitives/

 i did have also a look on this much complete (and complex) package from Elijah Insua :
 https://www.npmjs.com/package/2d-polygon-self-intersections
 but i did not use it because I just need true or false, and don't need any callback
 function on any intersection, nor do i need 2 other dependencies
 */
import Log from 'cgil-log'
import {DEV} from './config'

export const PRECISION = 10
export const EPSILON = Number(`1e-${PRECISION}`) // 1e-10 or 0.0000000001
const MODULE_NAME = 'cgil-2d-geom-utils'
const log = (DEV) ? new Log(MODULE_NAME, 4) : new Log(MODULE_NAME, 2)

/**
 * pointsIsEqual allow to know if two array points are equal (difference lower then EPSILON)
 * @param {array} p0 an array [x,y] representing a point in cartesian 2D space
 * @param {array} p1 an array [x,y] representing a point in cartesian 2D space
 * @return {boolean}  true if p0 and p1 are equal false elsewhere
 */
export function pointsIsEqual (p0, p1) {
  return (
    (Math.abs(p0[0] - p1[0]) <= EPSILON) &&
    (Math.abs(p0[1] - p1[1]) <= EPSILON)
  )
}

/**
 * distance2Point gives the distance in 2D space between 2 points
 * @param p0 an array [x,y] representing a point in cartesian 2D space
 * @param p1 an array [x,y] representing a point in cartesian 2D space
 * @return {number} the distance in 2D cartesian space between p0 and p1
 */
export function distance2Point (p0, p1) {
  return (Math.sqrt(
    ((p0[0] - p1[0]) * (p0[0] - p1[0])) +
      ((p0[1] - p1[1]) * (p0[1] - p1[1]))
  )
  )
}

/**
 * Simplistic Point class to be used only in polygonSelfIntersect
 */
class Point {
  constructor (x, y, name = '') {
    this.x = x
    this.y = y
    this.name = name // mainly for debug purpose
  }
}

/**
 * Simplistic Segment class to be used only in polygonSelfIntersect
 */
class Segment {
  constructor (p1, p2, name = '') {
    this.p1 = p1
    this.p2 = p2
    this.name = name // mainly for debug purpose
  }
}

/* 6.1 geometric primitives : https://algs4.cs.princeton.edu/91primitives/
 And  Book : Algorithms in C++ by Robert Sedgewick Addison-Wesley ISBN 0-201-51059-6

 */
function isCcw (p1, p2, p3) {
  return (p2.x - p1.x) * (p3.y - p1.y) - (p3.x - p1.x) * (p2.y - p1.y)
}
// l1 and l2 are segments
function intersects (l1, l2) {
  if (isCcw(l1.p1, l1.p2, l2.p1) * isCcw(l1.p1, l1.p2, l2.p2) > 0) return false
  if (isCcw(l2.p1, l2.p2, l1.p1) * isCcw(l2.p1, l2.p2, l1.p2) > 0) return false
  return true
}

/**
 * polygonSelfIntersect allows to know if a polygon as a self-intersection
 * @param arr2DPolygonCoords array of x,y coordinates values from the vertices of external ring of a closed Polygon (last two x,y values should be equal to first)
 * @return {boolean} true if there is a self-intersection in the polygon.  false elsewhere
 */
export function polygonSelfIntersect (arr2DPolygonCoords) {
  let PointSegments = []
  let Segments = []
  let offset = 0
  for (let i = 0; i < ((arr2DPolygonCoords.length / 2)); i++) {
    offset = i * 2
    PointSegments.push(new Point(arr2DPolygonCoords[offset], arr2DPolygonCoords[offset + 1], `P${i + 1}`))
  }
  // last point is supposed to be equal to first point of polygon (closed polygon)
  PointSegments[PointSegments.length - 1].name = PointSegments[0].name
  for (let i = 0; i < (PointSegments.length - 1); i++) {
    Segments.push(new Segment(PointSegments[i], PointSegments[i + 1], `S${i + 1}`))
  }
  for (let i = 0; i < Segments.length; i++) {
    for (let j = i + 2; j < Segments.length; j++) { // no need to test adjacent segments
      // console.log(i,j,Segments[i],Segments[j])
      if (!((i === 0) && (j === (Segments.length - 1)))) { // no need to test connection from first segment with last one
        if (intersects(Segments[i], Segments[j])) {
          log.w(`WARNING Segment ${Segments[i].name} intersects with ${Segments[j].name}`)
          return true
        } else {
          log.l(`OK Segment ${Segments[i].name} does not intersects with ${Segments[j].name}`)
        }
      }
    }
  }
  return false
}
