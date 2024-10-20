import { css, injectGlobal } from "@emotion/css"
import React, { useState } from "react"
import { useAppconda } from "../context/Appconda"


const GoogleLogo = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" height="1.25em" viewBox="0 0 600 600" width="1.25em">

        <path d="M533.5 278.4c0-18.5-1.5-37.1-4.7-55.3H272.1v104.8h147c-6.1 33.8-25.7 63.7-54.4 82.7v68h87.7c51.5-47.4 81.1-117.4 81.1-200.2z" fill="#4285f4" />
        <path d="M272.1 544.3c73.4 0 135.3-24.1 180.4-65.7l-87.7-68c-24.4 16.6-55.9 26-92.6 26-71 0-131.2-47.9-152.8-112.3H28.9v70.1c46.2 91.9 140.3 149.9 243.2 149.9z" fill="#34a853" />
        <path d="M119.3 324.3c-11.4-33.8-11.4-70.4 0-104.2V150H28.9c-38.6 76.9-38.6 167.5 0 244.4l90.4-70.1z" fill="#fbbc04" />
        <path d="M272.1 107.7c38.8-.6 76.3 14 104.4 40.8l77.7-77.7C405 24.6 339.7-.8 272.1 0 169.2 0 75.1 58 28.9 150l90.4 70.1c21.5-64.5 81.8-112.4 152.8-112.4z" fill="#ea4335" />
    </svg>
)

const pageContainer = css`
    display: flex;
    justify-content: center;
    height: 100vh;
    width: 100vw;
    overflow: scroll;
    align-items: flex-start;
    padding-top: clamp(2rem, 10vw, 5rem);
    background-color:#ffffff;
`

const devBanner = css`
    background-color: #6c47ff;
    color: #fff;
    font-family: Inter, system-ui, sans-serif;
    font-weight: 400;
    font-size: 14px;
    padding: 1rem 2rem;
    position: fixed;
    text-align: center;
    bottom: 0;
    width: 100vw;
    z-index: 20;
`

const componentContainer = css`
    margin-bottom: 5rem;
`
const rootBox = css`
    
`

const cardBox = css`
    box-sizing: border-box;
    display: flex;
    flex-flow: column;
    -webkit-box-align: stretch;
    align-items: stretch;
    -webkit-box-pack: start;
    justify-content: flex-start;
    isolation: isolate;
    max-width: calc(-2.5rem + 100vw);
    width: 25rem;
    border-style: solid;
    border-color: rgba(0, 0, 0, 0.07);
    border-radius: 0.75rem;
    color: rgb(33, 33, 38);
    position: relative;
    overflow: hidden;
    border-width: 0px;
    box-shadow: rgba(0, 0, 0, 0.08) 0px 5px 15px 0px, rgba(25, 28, 33, 0.2) 0px 15px 35px -5px, rgba(0, 0, 0, 0.07) 0px 0px 0px 1px;
`

const card = css`
    box-sizing: border-box;
    display: flex;
    flex-flow: column;
    -webkit-box-align: stretch;
    align-items: stretch;
    gap: 2rem;
    background-color: white;
    transition-property: background-color, background, border-color, color, fill, stroke, opacity, box-shadow, transform;
    transition-duration: 200ms;
    text-align: center;
    z-index: 10;
    border-style: solid;
    border-color: rgba(0, 0, 0, 0.03);
    border-radius: 0.5rem;
    position: relative;
    padding: 2rem 2.5rem;
    -webkit-box-pack: center;
    place-content: center;
    border-width: 0px;
    box-shadow: rgba(0, 0, 0, 0.08) 0px 0px 2px 0px, rgba(25, 28, 33, 0.06) 0px 1px 2px 0px, rgba(0, 0, 0, 0.03) 0px 0px 0px 1px;
`

const cardHeader = css`
   box-sizing: border-box;
    display: flex;
    flex-flow: column;
    -webkit-box-align: stretch;
    align-items: stretch;
    -webkit-box-pack: start;
    justify-content: flex-start;
    gap: 1.5rem;
`

const cardHeaderInternal = css`
    box-sizing: border-box;
    display: flex;
    flex-flow: column;
    -webkit-box-align: stretch;
    align-items: stretch;
    -webkit-box-pack: start;
    justify-content: flex-start;
    gap: 0.25rem;
`

const headerTitle = css`
    box-sizing: border-box;
    color: rgb(33, 33, 38);
    margin: 0px;
    font-family: inherit;
    letter-spacing: normal;
    font-weight: 700;
    font-size: 1.0625rem;
    line-height: 1.41176;


`

const headerSubtitle = css`
    box-sizing: border-box;
    margin: 0px;
    font-size: 0.8125rem;
    font-family: inherit;
    letter-spacing: normal;
    font-weight: 400;
    line-height: 1.38462;
    color: rgb(116, 118, 134);
    overflow-wrap: break-word;

`

const main = css`
    box-sizing: border-box;
    display: flex;
    flex-flow: column;
    -webkit-box-align: stretch;
    align-items: stretch;
    -webkit-box-pack: start;
    justify-content: flex-start;
    gap: 1.5rem;

`

const mainInternal = css`
    box-sizing: border-box;
    display: flex;
    flex-flow: column;
    -webkit-box-align: stretch;
    align-items: stretch;
    -webkit-box-pack: start;
    justify-content: flex-start;
    gap: 0.5rem;

`

const socialButtons = css`
    box-sizing: border-box;
    display: grid;
    -webkit-box-align: stretch;
    align-items: stretch;
    gap: 0.5rem;
    -webkit-box-pack: center;
    justify-content: center;
    grid-template-columns: repeat(1, 1fr);

`
const socialButtonsBlockButton = css`
    border-width: 0px;
    box-shadow: rgba(0, 0, 0, 0.07) 0px 0px 0px 1px, rgba(0, 0, 0, 0.08) 0px 2px 3px -1px, rgba(0, 0, 0, 0.02) 0px 1px 0px 0px;
    margin: 0px;
    padding: 0.375rem 0.75rem;
    border-width: 1px;
    outline: 0px;
    user-select: none;
    cursor: pointer;
    background-color: unset;
    color: rgba(0, 0, 0, 0.62);
    border-radius: 0.375rem;
    isolation: isolate;
    display: inline-flex;
    -webkit-box-align: center;
    align-items: center;
    transition-property: background-color, background, border-color, color, fill, stroke, opacity, box-shadow, transform;
    transition-duration: 100ms;
    font-family: inherit;
    letter-spacing: normal;
    font-weight: 500;
    font-size: 0.8125rem;
    line-height: 1.38462;
    border-style: solid;
    border-color: rgba(0, 0, 0, 0.07);
    box-shadow: rgba(0, 0, 0, 0.08) 0px 2px 3px -1px, rgba(0, 0, 0, 0.02) 0px 1px 0px 0px;
    width: 100%;
    --accent: hsla(252, 100%, 63%, 1);
    --accentHover: hsla(252, 100%, 73%, 1);
    --border: hsla(252, 100%, 63%, 1);
    --accentContrast: white;
    --alpha: hsla(0, 0%, 0%, 0.03);
    gap: 1rem;
    position: relative;
    -webkit-box-pack: start;
    justify-content: flex-start;

    &:hover {
        background-color: rgba(0, 0, 0, 0.03);
    }
`

const socialButtonsBlockButtonSpan = css`
    box-sizing: border-box;
    display: flex;
    flex-flow: row;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: center;
    justify-content: center;
    gap: 0.75rem;
    width: 100%;
    overflow: hidden;
`
const socialButtonsBlockButtonSpan2 = css`
   box-sizing: border-box;
    display: flex;
    flex-flow: row;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: center;
    justify-content: center;
    flex: 0 0 1rem;
`

const buttonTextGoogle = css`
   box-sizing: border-box;
    margin: 0px;
    font-size: 0.8125rem;
    font-family: inherit;
    letter-spacing: normal;
    font-weight: 500;
    line-height: 1.38462;
    color: inherit;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
`

const dividerRow = css`
    box-sizing: border-box;
    display: flex;
    flex-flow: row;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: center;
    justify-content: center;
`

const dividerLine = css`
    box-sizing: border-box;
    display: flex;
    flex-flow: row;
    -webkit-box-align: stretch;
    align-items: stretch;
    -webkit-box-pack: start;
    justify-content: flex-start;
    flex: 1 1 0%;
    height: 1px;
    background-color: rgba(0, 0, 0, 0.07);
`

const dividerText = css`
    box-sizing: border-box;
    font-size: 0.8125rem;
    font-family: inherit;
    letter-spacing: normal;
    font-weight: 400;
    line-height: 1.38462;
    color: rgb(116, 118, 134);
    margin: 0px 1rem;
`

injectGlobal`

.cl-internal-w8uam1 {
    box-sizing: border-box;
    display: flex;
    flex-flow: column;
    -webkit-box-align: stretch;
    align-items: stretch;
    -webkit-box-pack: start;
    justify-content: flex-start;
    gap: 1.5rem;
}

.cl-internal-1yma7i9 {
box-sizing: border-box;
display: flex;
flex-flow: row;
-webkit-box-align: stretch;
align-items: stretch;
-webkit-box-pack: justify;
justify-content: space-between;
gap: 1rem;
}

.cl-internal-10rdw13 {
box-sizing: border-box;
display: flex;
flex-flow: column;
-webkit-box-align: stretch;
align-items: stretch;
-webkit-box-pack: start;
justify-content: flex-start;
position: relative;
flex: 1 1 auto;
}

.cl-internal-11m7oop {
box-sizing: border-box;
display: flex;
flex-flow: column;
-webkit-box-align: stretch;
align-items: stretch;
-webkit-box-pack: start;
justify-content: flex-start;
gap: 0.5rem;
}

.cl-internal-66mzqw {
box-sizing: border-box;
display: flex;
flex-flow: row;
-webkit-box-align: center;
align-items: center;
-webkit-box-pack: justify;
justify-content: space-between;
}

.cl-internal-1c7fjmu {
color: rgb(33, 33, 38);
font-family: inherit;
letter-spacing: normal;
font-weight: 500;
font-size: 0.8125rem;
line-height: 1.38462;
display: flex;
-webkit-box-align: center;
align-items: center;
}


.cl-internal-1vc8j8r {
box-sizing: border-box;
margin: 0px;
padding: 0.375rem 0.75rem;
background-color: white;
color: rgb(19, 19, 22);
outline: transparent solid 2px;
outline-offset: 2px;
max-height: 2.25rem;
width: 100%;
aspect-ratio: unset;
accent-color: rgb(104, 66, 255);
font-family: inherit;
letter-spacing: normal;
font-weight: 400;
font-size: 0.8125rem;
line-height: 1.38462;
border-radius: 0.375rem;
border-width: 1px;
border-style: solid;
border-color: rgba(0, 0, 0, 0.11);
box-shadow: rgba(0, 0, 0, 0.07) 0px 0px 1px 0px;
transition-property: background-color, background, border-color, color, fill, stroke, opacity, box-shadow, transform;
transition-timing-function: ease;
transition-duration: 200ms;
}

.cl-internal-1vc8j8r[data-variant="default"] {
border-width: 0px;
box-shadow: rgba(0, 0, 0, 0.11) 0px 0px 0px 1px, rgba(0, 0, 0, 0.07) 0px 0px 1px 0px;
}

.cl-internal-ct77wn {
box-sizing: border-box;
display: flex;
flex-flow: row;
-webkit-box-align: stretch;
align-items: stretch;
-webkit-box-pack: start;
justify-content: flex-start;
animation: 450ms ease 0s 1 normal none running animation-9p3mh3;
transition-property: height;
transition-duration: 200ms;
transition-timing-function: ease;
}

.cl-internal-1kxguf4 {
box-sizing: border-box;
display: flex;
flex-flow: row;
-webkit-box-align: stretch;
align-items: stretch;
-webkit-box-pack: justify;
justify-content: space-between;
gap: 1rem;
position: absolute;
opacity: 0;
height: 0px;
pointer-events: none;
margin-top: -1rem;
}

.cl-internal-10rdw13 {
box-sizing: border-box;
display: flex;
flex-flow: column;
-webkit-box-align: stretch;
align-items: stretch;
-webkit-box-pack: start;
justify-content: flex-start;
position: relative;
flex: 1 1 auto;
}

.cl-internal-11m7oop {
box-sizing: border-box;
display: flex;
flex-flow: column;
-webkit-box-align: stretch;
align-items: stretch;
-webkit-box-pack: start;
justify-content: flex-start;
gap: 0.5rem;
}

.cl-internal-66mzqw {
box-sizing: border-box;
display: flex;
flex-flow: row;
-webkit-box-align: center;
align-items: center;
-webkit-box-pack: justify;
justify-content: space-between;
}

.cl-internal-1c7fjmu {
color: rgb(33, 33, 38);
font-family: inherit;
letter-spacing: normal;
font-weight: 500;
font-size: 0.8125rem;
line-height: 1.38462;
display: flex;
-webkit-box-align: center;
align-items: center;
}

.cl-internal-i1u4p8 {
box-sizing: border-box;
display: flex;
flex-flow: column;
-webkit-box-align: stretch;
align-items: stretch;
-webkit-box-pack: center;
justify-content: center;
position: relative;
}

.cl-internal-18nsyma {
box-sizing: border-box;
margin: 0px;
padding: 0.375rem 2.5rem 0.375rem 0.75rem;
background-color: white;
color: rgb(19, 19, 22);
outline: transparent solid 2px;
outline-offset: 2px;
max-height: 2.25rem;
width: 100%;
aspect-ratio: unset;
accent-color: rgb(104, 66, 255);
font-family: inherit;
letter-spacing: normal;
font-weight: 400;
font-size: 0.8125rem;
line-height: 1.38462;
border-radius: 0.375rem;
border-width: 1px;
border-style: solid;
border-color: rgba(0, 0, 0, 0.11);
box-shadow: rgba(0, 0, 0, 0.07) 0px 0px 1px 0px;
transition-property: background-color, background, border-color, color, fill, stroke, opacity, box-shadow, transform;
transition-timing-function: ease;
transition-duration: 200ms;
}

.cl-internal-18nsyma[data-variant="default"] {
border-width: 0px;
box-shadow: rgba(0, 0, 0, 0.11) 0px 0px 0px 1px, rgba(0, 0, 0, 0.07) 0px 0px 1px 0px;
}

.cl-internal-1ab5cam {
margin: 0px 0.25rem 0px 0px;
padding: 0.25rem 0.75rem;
border-width: 0px;
outline: 0px;
user-select: none;
cursor: pointer;
background-color: unset;
border-radius: 0.375rem;
isolation: isolate;
display: inline-flex;
-webkit-box-pack: center;
justify-content: center;
-webkit-box-align: center;
align-items: center;
transition-property: background-color, background, border-color, color, fill, stroke, opacity, box-shadow, transform;
transition-duration: 100ms;
font-family: inherit;
letter-spacing: normal;
font-weight: 500;
font-size: 0.8125rem;
line-height: 1.38462;
--accent: hsla(252, 100%, 63%, 1);
--accentHover: hsla(252, 100%, 73%, 1);
--border: hsla(252, 100%, 63%, 1);
--accentContrast: white;
--alpha: hsla(0, 0%, 0%, 0.03);
position: absolute;
right: 0px;
color: rgba(0, 0, 0, 0.41);
}

.cl-internal-oaq42g {
flex-shrink: 0;
width: 1rem;
height: 1rem;
}

.cl-internal-ct77wn {
box-sizing: border-box;
display: flex;
flex-flow: row;
-webkit-box-align: stretch;
align-items: stretch;
-webkit-box-pack: start;
justify-content: flex-start;
animation: 450ms ease 0s 1 normal none running animation-9p3mh3;
transition-property: height;
transition-duration: 200ms;
transition-timing-function: ease;
}

.cl-internal-10liqrf {
margin: 0px;
padding: 0.375rem 0.75rem;
border-width: 1px;
outline: 0px;
user-select: none;
cursor: pointer;
background-color: var(--accent);
color: var(--accentContrast);
border-radius: 0.375rem;
position: relative;
isolation: isolate;
display: inline-flex;
-webkit-box-pack: center;
justify-content: center;
-webkit-box-align: center;
align-items: center;
transition-property: background-color, background, border-color, color, fill, stroke, opacity, box-shadow, transform;
transition-duration: 100ms;
font-family: inherit;
letter-spacing: normal;
font-weight: 500;
font-size: 0.8125rem;
line-height: 1.38462;
box-shadow: rgba(255, 255, 255, 0.07) 0px 1px 1px 0px inset, rgba(34, 42, 53, 0.2) 0px 2px 3px 0px, rgba(0, 0, 0, 0.24) 0px 1px 1px 0px;
border-style: solid;
border-color: var(--accent);
width: 100%;
--accent: hsla(252, 100%, 63%, 1);
--accentHover: hsla(252, 100%, 73%, 1);
--border: hsla(252, 100%, 63%, 1);
--accentContrast: white;
--alpha: hsla(0, 0%, 0%, 0.03);
}

.cl-internal-10liqrf[data-variant="solid"][data-color="primary"] {
box-shadow: rgb(104, 66, 255) 0px 0px 0px 1px, rgba(255, 255, 255, 0.07) 0px 1px 1px 0px inset, rgba(34, 42, 53, 0.2) 0px 2px 3px 0px, rgba(0, 0, 0, 0.24) 0px 1px 1px 0px;
}

.cl-internal-4x6jej {
box-sizing: border-box;
display: flex;
flex-flow: column;
-webkit-box-align: center;
align-items: center;
-webkit-box-pack: center;
justify-content: center;
margin-top: -0.5rem;
padding-top: 0.5rem;
background: linear-gradient(rgba(0, 0, 0, 0.03), rgba(0, 0, 0, 0.03)), linear-gradient(rgb(255, 255, 255), rgb(255, 255, 255));
}

.cl-internal-1rpdi70 {
box-sizing: border-box;
display: flex;
flex-flow: row;
-webkit-box-align: stretch;
align-items: stretch;
-webkit-box-pack: start;
justify-content: flex-start;
gap: 0.25rem;
margin: 0px auto;
}

.cl-internal-kyvqj0 {
box-sizing: border-box;
margin: 0px;
font-size: 0.8125rem;
font-family: inherit;
letter-spacing: normal;
font-weight: 400;
line-height: 1.38462;
color: rgb(116, 118, 134);
}

.cl-internal-27wqok {
box-sizing: border-box;
display: inline-flex;
-webkit-box-align: center;
align-items: center;
margin: 0px;
cursor: pointer;
text-decoration: none;
font-family: inherit;
letter-spacing: normal;
font-weight: 500;
font-size: 0.8125rem;
line-height: 1.38462;
color: rgb(104, 66, 255);
}

.cl-internal-1dauvpw {
box-sizing: border-box;
width: 100%;
position: relative;
isolation: isolate;
}

.cl-internal-4x6jej > :not(:first-of-type) {
padding: 1rem 2rem;
border-top: 1px solid rgba(0, 0, 0, 0.07);
}

.cl-internal-piyvrh {
box-sizing: border-box;
user-select: none;
pointer-events: none;
inset: 0px;
position: absolute;
background: repeating-linear-gradient(-45deg, rgba(243, 104, 18, 0.07), rgba(243, 104, 18, 0.07) 6px, rgba(243, 104, 18, 0.11) 6px, rgba(243, 104, 18, 0.11) 12px);
mask-image: linear-gradient(transparent 0%, black);
}

.cl-internal-df7v37 {
box-sizing: border-box;
display: flex;
flex-flow: column;
gap: 0.5rem;
margin-left: auto;
margin-right: auto;
width: 100%;
-webkit-box-pack: center;
justify-content: center;
-webkit-box-align: center;
align-items: center;
z-index: 1;
position: relative;
}

.cl-internal-y44tp9 {
box-sizing: border-box;
display: flex;
flex-flow: row;
-webkit-box-align: stretch;
align-items: stretch;
-webkit-box-pack: justify;
justify-content: space-between;
width: 100%;
}

.cl-internal-y44tp9:has(div:only-child) {
-webkit-box-pack: center;
justify-content: center;
}

.cl-internal-16mc20d {
box-sizing: border-box;
display: flex;
flex-flow: row;
-webkit-box-align: center;
align-items: center;
-webkit-box-pack: center;
justify-content: center;
gap: 0.25rem;
color: rgb(116, 118, 134);
}

.cl-internal-wf8x4b {
box-sizing: border-box;
margin: 0px;
font-size: 0.75rem;
font-family: inherit;
letter-spacing: normal;
font-weight: 500;
line-height: 1.33333;
color: inherit;
}

.cl-internal-1fcj7sw {
box-sizing: border-box;
display: inline-flex;
-webkit-box-align: center;
align-items: center;
margin: 0px;
cursor: pointer;
text-decoration: none;
font-family: inherit;
letter-spacing: normal;
font-weight: 400;
font-size: 0.8125rem;
line-height: 1.38462;
color: inherit;
}

.cl-internal-5ghyhf {
flex-shrink: 0;
width: 3rem;
height: 0.875rem;
}

.cl-internal-16vtwdp {
box-sizing: border-box;
margin: 0px;
font-size: 0.8125rem;
font-family: inherit;
letter-spacing: normal;
line-height: 1.38462;
color: rgb(243, 107, 22);
font-weight: 600;
padding: 0px;
}

.cl-internal-10liqrf[data-variant="solid"]::after {
    position: absolute;
    content: "";
    border-radius: inherit;
    z-index: -1;
    inset: 0px;
    opacity: 1;
    transition-property: background-color, background, border-color, color, fill, stroke, opacity, box-shadow, transform;
    transition-duration: 100ms;
    background: linear-gradient(rgba(255, 255, 255, 0.11) 0%, transparent 100%);
}

.cl-internal-1c4ikgf {
    flex-shrink: 0;
    margin-left: 0.5rem;
    width: 0.625rem;
    height: 0.625rem;
    opacity: 0.62;
}

.cl-internal-10liqrf:hover {
    background-color: var(--accentHover);
}

`
const form = css`
  box-sizing: border-box;
    display: flex;
    flex-flow: column;
    -webkit-box-align: stretch;
    align-items: stretch;
    -webkit-box-pack: start;
    justify-content: flex-start;
    gap: 2rem;


`
const formInternalDiv = css`
  box-sizing: border-box;
    display: flex;
    flex-flow: column;
    -webkit-box-align: stretch;
    align-items: stretch;
    -webkit-box-pack: start;
    justify-content: flex-start;
    gap: 1.5rem;
`

export const SignIn = ({ title, onSuccess }: { title: string, onSuccess: Function }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const appconda = useAppconda();

    const createEmalSession = async () => {
        try {
            await appconda.account.createEmailPasswordSession(email, password);
            onSuccess?.();
        } catch {

        }
    }
    //mert@example.com

    return (
        <div className={pageContainer}>
            <div className={devBanner}>
                <p>Appwrite is in development mode. Sign up or sign in to continue.</p>
            </div>
            <div className={componentContainer}>
                <div className={rootBox}>
                    <div className={cardBox}>
                        <div className={card}>
                            <div className={cardHeader}>
                                <div className={cardHeaderInternal}>
                                    <h1 className={headerTitle} data-localization-key="signIn.start.title">{`Sign in to ${title}`}</h1>
                                    <p className={headerSubtitle} data-localization-key="signIn.start.subtitle">
                                        Welcome back! Please sign in to continue
                                    </p>
                                </div>
                            </div>
                            <div className={main}>
                                <div className={mainInternal}>
                                    <div className={socialButtons}>
                                        <button className={socialButtonsBlockButton} data-variant="outline" data-color="primary">
                                            <span className={socialButtonsBlockButtonSpan}>
                                                <span className={socialButtonsBlockButtonSpan2}>
                                                    <GoogleLogo></GoogleLogo>
                                                </span>
                                                <span className={buttonTextGoogle} data-localization-key="socialButtonsBlockButton">Continue with Google</span>
                                            </span></button>
                                    </div>
                                </div>
                                <div className={dividerRow}>
                                    <div className={dividerLine}></div>
                                    <p className={dividerText} data-localization-key="dividerText">or</p>
                                    <div className={dividerLine}></div>
                                </div>
                                <div className={form}>
                                    <div className={formInternalDiv}>
                                        <div className="cl-formFieldRow cl-formFieldRow__identifier 🔒️ cl-internal-1yma7i9">
                                            <div className="cl-formField cl-formField__identifier 🔒️ cl-internal-10rdw13">
                                                <div className="cl-internal-11m7oop">
                                                    <div className="cl-formFieldLabelRow cl-formFieldLabelRow__identifier 🔒️ cl-internal-66mzqw">
                                                        <label className="cl-formFieldLabel cl-formFieldLabel__identifier-field cl-required 🔒️ cl-internal-1c7fjmu"
                                                            data-localization-key="formFieldLabel__emailAddress"
                                                        >Email address
                                                        </label>
                                                    </div>
                                                    <input className="cl-formFieldInput cl-input cl-formFieldInput__identifier cl-input__identifier cl-required 🔒️
                                                     cl-internal-1vc8j8r" id="identifier-field" name="identifier" placeholder="" type="text"
                                                        pattern="^.*@[a-zA-Z0-9\-]+\.[a-zA-Z0-9\-\.]+$" required
                                                        aria-invalid="false" aria-required="true" aria-disabled="false" data-feedback="info"
                                                        data-variant="default" value={email} onChange={(event) => setEmail(event.target.value)} />
                                                </div>
                                                <div className="cl-internal-ct77wn" style={{ height: '0px', position: 'relative' }}></div>
                                            </div>
                                        </div>
                                        <div className="cl-formFieldRow cl-formFieldRow__password 🔒️ cl-internal-1kxguf4">
                                            <div className="cl-formField cl-formField__password 🔒️ cl-internal-10rdw13">
                                                <div className="cl-internal-11m7oop">
                                                    <div className="cl-formFieldLabelRow cl-formFieldLabelRow__password 🔒️ cl-internal-66mzqw">
                                                        <label className="cl-formFieldLabel cl-formFieldLabel__password-field 🔒️ cl-internal-1c7fjmu"
                                                            data-localization-key="formFieldLabel__password" >
                                                            Password
                                                        </label>
                                                    </div>
                                                    <div className="cl-formFieldInputGroup 🔒️ cl-internal-i1u4p8">
                                                        <input className="cl-formFieldInput cl-input cl-formFieldInput__password cl-input__password 🔒️
                                                         cl-internal-18nsyma" name="password" tabIndex={-1} placeholder="" type="password"
                                                            id="password-field" aria-invalid="false" aria-required="false" aria-disabled="false"
                                                            data-feedback="info" data-variant="default" value="" />
                                                        <button className="cl-formFieldInputShowPasswordButton cl-button 🔒️ cl-internal-1ab5cam" aria-label="Show password" tabIndex={-1} data-variant="ghost" data-color="primary">
                                                            <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className="cl-formFieldInputShowPasswordIcon 🔒️ cl-internal-oaq42g">
                                                                <path d="M8 9.607c.421 0 .825-.17 1.123-.47a1.617 1.617 0 0 0 0-2.273 1.578 1.578 0 0 0-2.246 0 1.617 1.617 0 0 0 0 2.272c.298.302.702.471 1.123.471Z"></path>
                                                                <path fill-rule="evenodd" clip-rule="evenodd" d="M2.07 8.38a1.073 1.073 0 0 1 0-.763 6.42 6.42 0 0 1 2.334-2.99A6.302 6.302 0 0 1 8 3.5c2.704 0 5.014 1.71 5.93 4.12.094.246.093.518 0 .763a6.418 6.418 0 0 1-2.334 2.99A6.301 6.301 0 0 1 8 12.5c-2.704 0-5.013-1.71-5.93-4.12ZM10.54 8c0 .682-.267 1.336-.743 1.818A2.526 2.526 0 0 1 8 10.571c-.674 0-1.32-.27-1.796-.753A2.587 2.587 0 0 1 5.459 8c0-.682.268-1.336.745-1.818A2.525 2.525 0 0 1 8 5.429c.674 0 1.32.27 1.797.753.476.482.744 1.136.744 1.818Z"></path>
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="cl-internal-ct77wn" style={{ height: '0px', position: 'relative' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="cl-internal-11m7oop"><div className="cl-formFieldLabelRow cl-formFieldLabelRow__password 🔒️ cl-internal-66mzqw">
                                        <label className="cl-formFieldLabel cl-formFieldLabel__password-field 🔒️ cl-internal-1c7fjmu"
                                            data-localization-key="formFieldLabel__password" >Password</label><a className="cl-formFieldAction cl-formFieldAction__password 🔒️ cl-internal-v0hosy" data-localization-key="formFieldAction__forgotPassword" href="">Forgot password?</a></div>
                                        <div className="cl-formFieldInputGroup 🔒️ cl-internal-i1u4p8">
                                            <input className="cl-formFieldInput cl-input cl-formFieldInput__password cl-input__password 🔒️ cl-internal-18nsyma" name="password"
                                                placeholder="" type="password" id="password-field" aria-invalid="false" aria-required="false" aria-disabled="false" data-feedback="info"
                                                data-variant="default" value={password} onChange={(event) => setPassword(event.target.value)} />
                                            <button className="cl-formFieldInputShowPasswordButton cl-button 🔒️ cl-internal-1ab5cam" aria-label="Show password" data-variant="ghost" data-color="primary">
                                                <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className="cl-formFieldInputShowPasswordIcon 🔒️ cl-internal-oaq42g">
                                                    <path d="M8 9.607c.421 0 .825-.17 1.123-.47a1.617 1.617 0 0 0 0-2.273 1.578 1.578 0 0 0-2.246 0 1.617 1.617 0 0 0 0 2.272c.298.302.702.471 1.123.471Z"></path>
                                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M2.07 8.38a1.073 1.073 0 0 1 0-.763 6.42 6.42 0 0 1 2.334-2.99A6.302 6.302 0 0 1 8 3.5c2.704 0 5.014 1.71 5.93 4.12.094.246.093.518 0 .763a6.418 6.418 0 0 1-2.334 2.99A6.301 6.301 0 0 1 8 12.5c-2.704 0-5.013-1.71-5.93-4.12ZM10.54 8c0 .682-.267 1.336-.743 1.818A2.526 2.526 0 0 1 8 10.571c-.674 0-1.32-.27-1.796-.753A2.587 2.587 0 0 1 5.459 8c0-.682.268-1.336.745-1.818A2.525 2.525 0 0 1 8 5.429c.674 0 1.32.27 1.797.753.476.482.744 1.136.744 1.818Z"></path>
                                                </svg></button></div>
                                    </div>
                                    <button className="cl-formButtonPrimary cl-button 🔒️ cl-internal-10liqrf"
                                        data-localization-key="formButtonPrimary" data-variant="solid" data-color="primary" onClick={createEmalSession}>
                                        <span className="cl-internal-2iusy0">
                                            Continue
                                            <svg className="cl-buttonArrowIcon 🔒️ cl-internal-1c4ikgf">
                                                <path fill="currentColor" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m7.25 5-3.5-2.25v4.5L7.25 5Z"></path>
                                            </svg>
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="cl-footer 🔒️ cl-internal-4x6jej">
                            <div className="cl-footerAction cl-footerAction__signIn 🔒️ cl-internal-1rpdi70"><span className="cl-footerActionText 🔒️ cl-internal-kyvqj0" data-localization-key="signIn.start.actionText">Don’t have an account?</span><a className="cl-footerActionLink 🔒️ cl-internal-27wqok" data-localization-key="signIn.start.actionLink" href="https://careful-labrador-89.accounts.dev/sign-up">Sign up</a></div>
                            <div className="cl-internal-1dauvpw">
                                <div className="cl-internal-piyvrh"></div>
                                <div className="cl-internal-df7v37">
                                    <div className="cl-internal-y44tp9">
                                        <div className="cl-internal-16mc20d">
                                            <p className="cl-internal-wf8x4b">Secured by</p>
                                            <a aria-label="Appwrite logo" className="cl-internal-1fcj7sw" href="https://www.appwrite.com?utm_source=appwrite&amp;utm_medium=components" target="_blank" rel="noopener">
                                                <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 14" className="cl-internal-5ghyhf">
                                                    <ellipse cx="7.889" cy="7" rx="2.187" ry="2.188" fill="currentColor"></ellipse>
                                                    <path d="M11.83 12.18a.415.415 0 0 1-.05.64A6.967 6.967 0 0 1 7.888 14a6.967 6.967 0 0 1-3.891-1.18.415.415 0 0 1-.051-.64l1.598-1.6a.473.473 0 0 1 .55-.074 3.92 3.92 0 0 0 1.794.431 3.92 3.92 0 0 0 1.792-.43.473.473 0 0 1 .551.074l1.599 1.598Z" fill="currentColor"></path>
                                                    <path opacity="0.5" d="M11.78 1.18a.415.415 0 0 1 .05.64l-1.598 1.6a.473.473 0 0 1-.55.073 3.937 3.937 0 0 0-5.3 5.3.473.473 0 0 1-.074.55L2.71 10.942a.415.415 0 0 1-.641-.051 7 7 0 0 1 9.71-9.71Z" fill="currentColor"></path>
                                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M23.748 1.422c0-.06.05-.11.11-.11h1.64c.06 0 .11.05.11.11v11.156a.11.11 0 0 1-.11.11h-1.64a.11.11 0 0 1-.11-.11V1.422Zm-2.315 8.9a.112.112 0 0 0-.15.004 2.88 2.88 0 0 1-.884.569c-.36.148-.747.222-1.137.219-.33.01-.658-.047-.965-.166a2.422 2.422 0 0 1-.817-.527c-.424-.432-.668-1.05-.668-1.785 0-1.473.98-2.48 2.45-2.48.394-.005.785.074 1.144.234.325.144.617.35.86.607.04.044.11.049.155.01l1.108-.959a.107.107 0 0 0 .01-.152c-.832-.93-2.138-1.412-3.379-1.412-2.499 0-4.27 1.686-4.27 4.166 0 1.227.44 2.26 1.182 2.99.743.728 1.801 1.157 3.022 1.157 1.53 0 2.763-.587 3.485-1.34a.107.107 0 0 0-.009-.155l-1.137-.98Zm13.212-1.14a.108.108 0 0 1-.107.096H28.79a.106.106 0 0 0-.104.132c.286 1.06 1.138 1.701 2.302 1.701a2.59 2.59 0 0 0 1.136-.236 2.55 2.55 0 0 0 .862-.645.08.08 0 0 1 .112-.01l1.155 1.006c.044.039.05.105.013.15-.698.823-1.828 1.42-3.38 1.42-2.386 0-4.185-1.651-4.185-4.162 0-1.232.424-2.264 1.13-2.994.373-.375.82-.67 1.314-.87a3.968 3.968 0 0 1 1.557-.285c2.419 0 3.983 1.701 3.983 4.05a6.737 6.737 0 0 1-.04.647Zm-5.924-1.524a.104.104 0 0 0 .103.133h3.821c.07 0 .123-.066.103-.134-.26-.901-.921-1.503-1.947-1.503a2.13 2.13 0 0 0-.88.16 2.1 2.1 0 0 0-.733.507 2.242 2.242 0 0 0-.467.837Zm11.651-3.172c.061-.001.11.048.11.109v1.837a.11.11 0 0 1-.117.109 7.17 7.17 0 0 0-.455-.024c-1.43 0-2.27 1.007-2.27 2.329v3.732a.11.11 0 0 1-.11.11h-1.64a.11.11 0 0 1-.11-.11v-7.87c0-.06.049-.109.11-.109h1.64c.06 0 .11.05.11.11v1.104a.011.011 0 0 0 .02.007c.64-.857 1.587-1.333 2.587-1.333l.125-.001Zm4.444 4.81a.035.035 0 0 1 .056.006l2.075 3.334a.11.11 0 0 0 .093.052h1.865a.11.11 0 0 0 .093-.168L46.152 7.93a.11.11 0 0 1 .012-.131l2.742-3.026a.11.11 0 0 0-.081-.183h-1.946a.11.11 0 0 0-.08.036l-3.173 3.458a.11.11 0 0 1-.19-.074V1.422a.11.11 0 0 0-.11-.11h-1.64a.11.11 0 0 0-.11.11v11.156c0 .06.05.11.11.11h1.64a.11.11 0 0 0 .11-.11v-1.755a.11.11 0 0 1 .03-.075l1.35-1.452Z" fill="currentColor"></path>
                                                </svg>
                                            </a>
                                        </div>
                                    </div>
                                    <p className="cl-internal-16vtwdp">Development mode</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


