/**
 * Equal Earth forward projection, adapted from d3-geo:
 * https://github.com/d3/d3-geo/blob/main/src/projection/equalEarth.js
 * Copyright 2010-2024 Mike Bostock
 *
 * Permission to use, copy, modify, and/or distribute this software for any purpose
 * with or without fee is hereby granted, provided that the above copyright notice
 * and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 * REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 * INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
 * OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
 * TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
 * THIS SOFTWARE.
 */
export function projectCountryPoint(longitude: number, latitude: number): string {
  const radians = Math.PI / 180;
  const m = Math.sqrt(3) / 2;
  const theta = Math.asin(m * Math.sin(latitude * radians));
  const theta2 = theta * theta;
  const theta6 = theta2 * theta2 * theta2;
  const x =
    (longitude * radians * Math.cos(theta)) /
    (m * (1.340264 - 3 * 0.081106 * theta2 + theta6 * (7 * 0.000893 + 9 * 0.003796 * theta2)));
  const y = theta * (1.340264 - 0.081106 * theta2 + theta6 * (0.000893 + 0.003796 * theta2));
  return `${(500 + 175 * x).toFixed(2)},${(230 - 175 * y).toFixed(2)}`;
}
