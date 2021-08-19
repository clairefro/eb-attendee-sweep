const fetch = require('node-fetch');
const fs = require('fs')

require('dotenv').config()

if(!process.env.EB_ACCESS_TOKEN || !process.env.EB_EVENT_ID) {
  console.error('Missing critical env vars. Make sure all variables are defined in .env file. Aborting. ')
  process.exit(1)
}
const baseUrl = `https://www.eventbriteapi.com/v3/events/${process.env.EB_EVENT_ID}/attendees`
const token = process.env.EB_ACCESS_TOKEN

const requestOpts = {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
}

const sweep = async (allAttendees = [], cursor) => {
  try {
    console.log('running sweep...')

    // call eventbrite API
    let url = baseUrl
    if(cursor) {
      url += `?continuation=${cursor}`
    }

    const res = await fetch(url, requestOpts)
    const body = await res.json()

    const { attendees, pagination } = body

    const { page_number, page_count } = pagination
    console.log(`Fetched page ${page_number}/${page_count}`)

    // append this page's attendees to master list
    allAttendees = [...allAttendees, ...attendees]

    console.log('attendee count: ', allAttendees.length)

    // determine whether to continue sweep
    if(pagination.has_more_items) {
        const next = pagination.continuation
        return await sweep(allAttendees, next)
    } else {
        const confirmedAttendees = allAttendees.filter(a => !a.cancelled)

        console.log(`Done.`)
        console.log(`All attendees: ${allAttendees.length}`)
        console.log(`Confirmed attendees: ${confirmedAttendees.length} `)

        return confirmedAttendees
    }
  } catch(e) {
    console.error(e.message)
  }
}

// run sweep to get all attendees
(async () => {
    const confirmedAttendees = await sweep() 
   
    // Write prettified output to file (for testing)
    const content = JSON.stringify(confirmedAttendees, null, 2)
    
    fs.writeFile('./output.json', content, err => {
        if (err) {
            return console.error(err)
        }
    })
})()
