## Eventbrite attendee sweeper

A script that gets all confirmed (not-cancelled) attendees for an Eventbrite event with a given `EB_EVENT_ID`

## Setup

Create a `.env` file based on `.env.example` by copying the example and filling in the values.

```shell
cp .env.example .env
```

Install packages

`yarn install`

## Run

`yarn start`

## Usage

You can do what you want with the fetched attendees by altering the IIFE at the bottom of `index.js`

```js
(async () => {
   const confirmedAttendees = await sweep()  // confirmed === not cancelled
   console.log(confirmedAttendees.length)
})()
```

## Rate limits

As of Jul 8, 2021, Eventbrite allows 2000 API calls/hr. (1 page = 1 call)