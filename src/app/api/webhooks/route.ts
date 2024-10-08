"use server"

import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { type WebhookEvent } from '@clerk/nextjs/server'

interface UserCreatedEventData {
  id: string;
}
interface EventData {
  id?: string;
}

function isUserCreatedEventData(data: EventData): data is UserCreatedEventData { // Type guard to check if evt.data is UserCreatedEventData
  return typeof data.id === 'string';
}

export async function POST(req: Request) {

  // You can find this in the Clerk Dashboard -> Webhooks -> choose the endpoint
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400
    })
  }

  // Get the body
  const payload = await req.json() as object[]
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', {
      status: 400
    })
  }

  const { id } = evt.data;
  const eventType = evt.type;
  console.log(`Webhook with and ID of ${id} and type of ${eventType}`)
  console.log('Webhook body:', body)

  if (eventType === 'user.created') {
    const data = evt.data as EventData;

    if (isUserCreatedEventData(data)) {
      const userId = data.id;
      if (userId) { 
        // Do something when the user is created
      }
    } else {
      console.error('Unexpected event data format for user.created:', data);
    }
  }

  return new Response('', { status: 200 })
}