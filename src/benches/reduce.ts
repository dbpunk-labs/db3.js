/**
 * Copyright 2023 the author of db3.js
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import b from 'benny'
b.suite(
    'Batch Get Query',

    b.add('Reduce two elements', () => {
        ;[1, 2].reduce((a, b) => a + b)
    }),

    b.add('Reduce five elements', () => {
        ;[1, 2, 3, 4, 5].reduce((a, b) => a + b)
    }),

    b.cycle(),
    b.complete(),
    b.save({ file: 'reduce', version: '1.0.0' }),
    b.save({ file: 'reduce', format: 'chart.html' })
)
