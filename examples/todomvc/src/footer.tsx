//
// footer.tsx
// Copyright (C) 2023 db3.network Author imotai <codego.me@gmail.com>
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

import React from 'react'
import FilterLink from './link'

const FILTER_TITLES = ['All', 'Active', 'Completed']

export interface IFooter {
    completedCount: number
    activeCount: number
}

function Footer(props: IFooter) {
    const { activeCount, completedCount } = props
    const itemWord = activeCount === 1 ? 'item' : 'items'
    return (
        <footer className="footer">
            <span className="todo-count">
                <strong>{activeCount || 'No'}</strong> {itemWord} left
            </span>
            <ul className="filters">
                {FILTER_TITLES.map((filter) => (
                    <li key={filter}>
                        <FilterLink filter={filter}>{filter}</FilterLink>
                    </li>
                ))}
            </ul>

        </footer>
    )
}

export default Footer
