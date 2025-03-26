// UK Postcode regex (case-insensitive)
const ukPostcodeRegex = /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i;

/**
 * Validates if a string matches a common UK postcode format.
 * @param postcode - The string to test.
 * @returns True if the string matches the pattern, false otherwise.
 */
export function isValidUKPostcode(postcode: string): boolean {
  // Trim whitespace before testing
  return ukPostcodeRegex.test(postcode.trim());
}

// Define specific error types for better handling
export class GeocodingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeocodingError';
  }
}

export class PostcodeNotFoundError extends GeocodingError {
  constructor(postcode: string) {
    super(`Postcode not found: ${postcode}`);
    this.name = 'PostcodeNotFoundError';
  }
}

export class InvalidPostcodeFormatError extends GeocodingError {
  constructor(postcode: string) {
    super(`Invalid UK postcode format: ${postcode}`);
    this.name = 'InvalidPostcodeFormatError';
  }
}

/**
 * Fetches latitude and longitude for a given UK postcode using the postcodes.io API.
 * Designed for backend use. Throws errors on failure.
 *
 * @param postcode - The UK postcode string.
 * @returns A promise resolving to an object with latitude and longitude.
 * @throws {InvalidPostcodeFormatError} if the postcode format is invalid.
 * @throws {PostcodeNotFoundError} if the postcode is not found by the API (404).
 * @throws {GeocodingError} for other API errors or network issues.
 */
export async function getCoordsFromPostcode(
  postcode: string
): Promise<{ latitude: number; longitude: number }> {
  const trimmedPostcode = postcode.trim();

  // 1. Validate the postcode format
  if (!isValidUKPostcode(trimmedPostcode)) {
    throw new InvalidPostcodeFormatError(trimmedPostcode);
  }

  // 2. Construct the API URL
  const apiUrl = `https://api.postcodes.io/postcodes/${encodeURIComponent(trimmedPostcode)}`;

  try {
    // 3. Fetch data
    const response = await fetch(apiUrl);

    // 4. Handle API errors
    if (!response.ok) {
      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      if (response.status === 404) {
        // Throw specific error for not found
        throw new PostcodeNotFoundError(trimmedPostcode);
      } else {
        try {
          const errorBody = await response.json();
          errorMessage = errorBody?.error || errorMessage;
        } catch (e) {
          /* Ignore parsing error */
        }
      }
      console.error(
        `Geocoding error for postcode ${trimmedPostcode}: ${errorMessage}`
      );
      throw new GeocodingError(errorMessage);
    }

    // 5. Parse the successful JSON response
    const data = await response.json();

    // 6. Extract coordinates
    const latitude = data?.result?.latitude;
    const longitude = data?.result?.longitude;

    // 7. Validate extracted coordinates
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      console.error(
        `Unexpected API response structure for postcode ${trimmedPostcode}:`,
        data
      );
      throw new GeocodingError(
        'Failed to parse coordinates from API response.'
      );
    }

    // 8. Return successful coordinates
    return { latitude, longitude };
  } catch (error: any) {
    // 9. Handle network or other unexpected errors, re-throw known errors
    if (error instanceof GeocodingError) {
      throw error; // Re-throw specific errors we already handled
    }
    console.error(
      `Failed to fetch geocoding data for postcode ${trimmedPostcode}:`,
      error
    );
    throw new GeocodingError(
      error.message || 'An unexpected error occurred during geocoding fetch.'
    );
  }
}
