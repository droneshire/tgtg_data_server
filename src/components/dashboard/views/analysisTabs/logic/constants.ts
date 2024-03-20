import { Coordinates } from "utils/demographics";

const LOCATIONS: Record<string, Coordinates> = {
  Portland: {
    latitude: 45.5152,
    longitude: -122.676483,
  },
  "New York": {
    latitude: 40.71,
    longitude: -74.01,
  },
};

const ADVANCED_FIELDS: string[] = [
  "places.formattedAddress",
  "places.displayName",
  "places.nationalPhoneNumber",
  "places.location",
  "places.rating",
  "places.googleMapsUri",
  "places.websiteUri",
  "places.regularOpeningHours",
  "places.businessStatus",
  "places.priceLevel",
  "places.userRatingCount",
  "places.takeout",
  "places.delivery",
  "places.dineIn",
  "places.servesBreakfast",
  "places.primaryTypeDisplayName",
  "places.primaryType",
  "places.editorialSummary",
  "places.outdoorSeating",
  "places.servesCoffee",
  "places.paymentOptions",
  "places.accessibilityOptions",
];

const TYPES: string[] = [
  "bakery",
  "sandwich_shop",
  "coffee_shop",
  "cafe",
  "fast_food_restaurant",
  "store",
  "restaurant",
  "food",
  "point_of_interest",
  "establishment",
];

const ADVANCED_PROMPT: string = `All ${TYPES.join(", ")}`;

const DEFAULT_PROMPTS = [
  "All restaurants", // This first one in the list is the default used for optimization purposes
  "All bakeries",
  "All grocery stores",
  "All coffee shops",
];

const METERS_PER_MILE = 1609.34;
const METERS_PER_KILOMETER = 1000.0;

export {
  LOCATIONS,
  ADVANCED_FIELDS,
  ADVANCED_PROMPT,
  DEFAULT_PROMPTS,
  METERS_PER_KILOMETER,
  METERS_PER_MILE,
};
