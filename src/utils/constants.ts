// admin user ids for feature flagging
export const ADMIN_USERS =  process.env.REACT_APP_ADMIN_USERS?.split(",") ?? [];
export const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY ?? "";

export const HEADER_TITLES = {
    storeName: "store_name",
    timeStamp: "timestamp",
    priceIncludingTax: "price_including_taxes",
    mealType: "item_type",
    mealCategory: "item_category",
    longitude: "pickup_location:location:longitude",
    latitude: "pickup_location:location:latitude",
    rating: "average_overall_rating:average_overall_rating",
};
