// src/actions/entityActions.ts
import { db } from '@/db';
import { Entity } from '@/db/schema';
import { defineAction } from 'astro:actions'; // Make sure to use astro:actions
import { z } from 'astro:schema'; // Import zod for schema validation
import { eq } from 'drizzle-orm';

// Import the backend geocoding function, validation helper, and custom errors
import {
  getCoordsFromPostcode,
  isValidUKPostcode,
  GeocodingError, // Base error class
  PostcodeNotFoundError, // Specific error for 404
  // InvalidPostcodeFormatError // This is checked by isValidUKPostcode before calling
} from '@/lib/geocoding'; // Adjust path if your file is elsewhere

export const entities = {
  getAllEntities: defineAction({
    handler: async () => {
      const entities = await db.query.Entity.findMany({
        with: {
          type: true, // Ensure related type data is fetched
        },
      });

      // Note: Drizzle returns 'numeric' as string. Convert if needed client-side.
      return { entities, serverTime: new Date().toLocaleTimeString() };
    },
  }),

  addEntity: defineAction({
    accept: 'json', // Specify this action is meant for client-side calls
    input: z.object({
      name: z.string(),
      description: z.string(),
      location: z.string(), // Location string from the form
      type: z.number(),
    }),
    handler: async ({ name, description, location, type }) => {
      let latitude: number | null = null;
      let longitude: number | null = null;
      let geocodingWarning: string | null = null;

      // Check if location looks like a postcode and try to geocode it
      if (location && isValidUKPostcode(location)) {
        try {
          // Call the backend utility function directly
          const coords = await getCoordsFromPostcode(location);
          latitude = coords.latitude;
          longitude = coords.longitude;
          console.log(`Geocoded ${location} to: ${latitude}, ${longitude}`); // Add logging
        } catch (error: any) {
          // Handle specific geocoding errors gracefully
          if (error instanceof PostcodeNotFoundError) {
            geocodingWarning = error.message; // e.g., "Postcode not found: SW1A 0AA"
            console.warn(
              `Geocoding warning for '${location}': ${geocodingWarning}`
            );
          } else if (error instanceof GeocodingError) {
            // Catches InvalidFormat & other GeoErrors
            geocodingWarning = `Geocoding failed for '${location}': ${error.message}`;
            console.warn(geocodingWarning);
          } else {
            // Unexpected error during geocoding
            geocodingWarning = `Unexpected geocoding error for '${location}': ${error.message}`;
            console.error(geocodingWarning, error);
          }
          // Saving null coordinates on geocoding failure
        }
      }

      try {
        // Insert into DB, converting coords to string for 'numeric' type
        await db.insert(Entity).values({
          name,
          description,
          location, // Save the original location string
          typeId: type,
          latitude: latitude?.toString() ?? null, // Convert number to string, handle null
          longitude: longitude?.toString() ?? null, // Convert number to string, handle null
        });
        // Return success and any geocoding warning
        return { success: true, warning: geocodingWarning };
      } catch (error: any) {
        console.error(`Database error adding entity '${name}':`, error);
        // Return DB error
        return { success: false, error: { message: error.message } };
      }
    },
  }),

  editEntity: defineAction({
    accept: 'json', // Specify this action is meant for client-side calls
    input: z.object({
      id: z.number(),
      name: z.string(),
      description: z.string(),
      location: z.string(),
      type: z.number(),
    }),
    handler: async ({ id, name, description, location, type }) => {
      let latitude: number | null = null;
      let longitude: number | null = null;
      let geocodingWarning: string | null = null;

      // Optionally, fetch current entity to see if location changed,
      // or just geocode if it looks valid. Let's just geocode if valid.
      if (location && isValidUKPostcode(location)) {
        try {
          // Call the backend utility function directly
          const coords = await getCoordsFromPostcode(location);
          latitude = coords.latitude;
          longitude = coords.longitude;
          console.log(
            `Geocoded ${location} to: ${latitude}, ${longitude} for edit`
          ); // Add logging
        } catch (error: any) {
          // Handle specific geocoding errors gracefully
          if (error instanceof PostcodeNotFoundError) {
            geocodingWarning = error.message;
            console.warn(
              `Geocoding warning for '${location}' during edit: ${geocodingWarning}`
            );
          } else if (error instanceof GeocodingError) {
            geocodingWarning = `Geocoding failed for '${location}' during edit: ${error.message}`;
            console.warn(geocodingWarning);
          } else {
            geocodingWarning = `Unexpected geocoding error for '${location}' during edit: ${error.message}`;
            console.error(geocodingWarning, error);
          }
          // Decide if you want to keep old coords or set to null on failure.
          // For simplicity, we update with null if geocoding failed.
        }
      } else if (location && location.trim() !== '') {
        // If location is present but not a valid postcode, warn and potentially clear coords?
        console.warn(
          `Location '${location}' provided for entity ${id} is not a valid UK postcode format. Coordinates will likely be null.`
        );
        // latitude/longitude remain null
      } else {
        // Location is empty, ensure coordinates are null
        latitude = null;
        longitude = null;
      }

      try {
        // Update entity in DB, converting coords to string for 'numeric' type
        await db
          .update(Entity)
          .set({
            name,
            description,
            location, // Save the potentially updated location string
            typeId: type,
            latitude: latitude?.toString() ?? null, // Convert number to string, handle null
            longitude: longitude?.toString() ?? null, // Convert number to string, handle null
          })
          .where(eq(Entity.id, id));

        // Return success and any geocoding warning
        return { success: true, warning: geocodingWarning };
      } catch (error: any) {
        console.error(`Database error editing entity ID ${id}:`, error);
        // Return DB error
        return { success: false, error: { message: error.message } };
      }
    },
  }),

  deleteEntity: defineAction({
    accept: 'json', // Specify this action is meant for client-side calls
    input: z.object({
      id: z.number(),
    }),
    handler: async ({ id }) => {
      try {
        await db.delete(Entity).where(eq(Entity.id, id));
        console.log(`Deleted entity ID ${id}`); // Add logging
        return { success: true };
      } catch (error: any) {
        console.error(`Database error deleting entity ID ${id}:`, error);
        // Foreign key constraint errors might happen here if relationships exist
        return { success: false, error: { message: error.message } };
      }
    },
  }),
};
