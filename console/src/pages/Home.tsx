import { useRouter } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button, HStack, Text, VStack } from "tuval";
import type { FunctionComponent } from "../common/types";

import DropdownMenu, { DropdownItem, DropdownItemGroup } from '@atlaskit/dropdown-menu';
import { useState } from "react";

import { Input } from '@mantine/core';
import { sdk } from "../sdk";
import { SignIn, SignOutButton, useAppconda, useGetMe } from "@appconda/react-sdk";

const AppHome = () => (
	<div
	/>
);

// Dropdown for navigation items
const NavDropdown = () => (
	<DropdownMenu trigger="Menu">
		<DropdownItemGroup>
			<DropdownItem href="#">Item 1</DropdownItem>
			<DropdownItem href="#">Item 2</DropdownItem>
			<DropdownItem href="#">Item 3</DropdownItem>
		</DropdownItemGroup>
	</DropdownMenu>
);

const AtlassianProductHome = () => <div />;


export const Home = (): FunctionComponent => {
	const { t } = useTranslation();
	const router = useRouter();
	const deleteSession = async (): Promise<void> => {
		try {
			const result = await sdk.account.deleteSession('current');
			console.log(result);
			router.navigate({ to: '/login' });
		} catch (error) {
			console.log(error);
		}
	}

	const onTranslateButtonClick = async (): Promise<void> => {


		const promise = sdk.account.createEmailPasswordSession('mert@example.com', 'AAA123bbb');

		promise.then(function (response) {
			console.log(response); // Success
		}, function (error) {
			console.log(error); // Failure
		});

		/* const promise = account.create('mert', 'mert@example.com', 'AAA123bbb');

		promise.then(function (response) {
			console.log(response); // Success
		}, function (error) {
			console.log(error); // Failure
		}); */
		/* if (i18n.resolvedLanguage === "en") {
			await i18n.changeLanguage("es");
		} else {
			await i18n.changeLanguage("en");
		} */
	};

	const onLogin = async (): Promise<void> => {

		const result = await sdk.account.get();
		const router = useRouter();

		console.log(result);

		/* const promise = account.getPrefs();

		promise.then(function (response) {
			console.log(response); // Success
		}, function (error) {
			console.log(error); // Failure
		});  */

		/* 	 const promise = account.createEmailPasswordSession('mert@example.com', 'AAA123bbb');
	
			promise.then(function (response) {
				console.log(response); // Success
			}, function (error) {
				console.log(error); // Failure
			});  */

		/* const promise = account.create('mert', 'mert@example.com', 'AAA123bbb');

		promise.then(function (response) {
			console.log(response); // Success
		}, function (error) {
			console.log(error); // Failure
		}); */
		/* if (i18n.resolvedLanguage === "en") {
			await i18n.changeLanguage("es");
		} else {
			await i18n.changeLanguage("en");
		} */
	};

	const me = useGetMe();
	const sdk = useAppconda();

	return (
		VStack(
			Text('Home')
		).render()
	);
}
