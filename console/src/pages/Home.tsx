import { Popover } from 'react-tiny-popover';
import { Text, VStack } from "tuval";
import type { FunctionComponent } from "../common/types";

import { useState } from 'react';




export const Home = (): FunctionComponent => {

	const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
	return (
		VStack(
			Text('Home'),
			<Popover
				isOpen={isPopoverOpen}
				positions={['bottom', 'top', 'left', 'right']} // preferred positions by priority
				content={<div>Hi! I'm popover content.</div>}
			>
				<div onClick={() => setIsPopoverOpen(!isPopoverOpen)}>
					Click me!
				</div>
			</Popover>
		).render()
	);
}
