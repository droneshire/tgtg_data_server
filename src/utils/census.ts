import * as T from "typing";
import * as censusgeocode from "censusgeocode";
import { Census } from "census";

import { DEFAULT_CENSUS_FIELDS_JSON_FILE } from "./constants";
import { dict_util, log } from "./util";
import { findInNestedDict } from "./generics";

class USCensusAPI {
  census: Census;
  census_fields_cache: T.Dict<string, T.Dict<string, any>>;
  verbose: boolean;

  constructor(api_key: string, verbose: boolean = false) {
    this.census = new Census(api_key);
    this.census_fields_cache = {};
    this.verbose = verbose;
  }

  get_census_data(field: string, address: string) {
    let result;
    try {
      result = censusgeocode.onelineaddress(address);
    } catch (error) {
      console.warn(`Could not find address: ${address}`);
      return null;
    }

    if (result === null) {
      console.warn(`Could not find address: ${address}`);
      return null;
    }

    if (this.verbose) {
      console.log(`Found address: ${address}`);
      console.log(`Result: ${JSON.stringify(result, null, 2)}`);
    }

    const state = this._item("STATE", result);
    const county = this._item("COUNTY", result);
    const tract = this._item("TRACT", result);
    const block_group = this._item("BLKGRP", result);

    if (!state || !county || !tract || !block_group) {
      console.warn(
        `Could not find geo info about ${field} for address: ${address}`
      );
      return null;
    }

    if (this.verbose) {
      console.log(`State: ${state}`);
      console.log(`County: ${county}`);
      console.log(`Tract: ${tract}`);
      console.log(`Block Group: ${block_group}`);
    }

    try {
      const result = this.census.acs5.state_county_blockgroup(
        field,
        state,
        county,
        { tract, blockgroup: block_group }
      );
    } catch (error) {
      console.warn(`Could not find census data for address: ${address}`);
      console.warn(error);
      return null;
    }

    if (!result) {
      console.warn(`Could not find census data for address: ${address}`);
      return null;
    }

    const data = result[0][field];

    log.print_bold(`Found ${this.get_description_for_field(field)}: ${data}`);

    return data;
  }

  get_description_for_field(field: string) {
    if (!(field in this.census_fields_cache)) {
      return field;
    }

    let return_string = this.census_fields_cache[field]?.concept ?? "";
    return_string += ": ";
    return_string +=
      this.census_fields_cache[field]?.label?.replace("!!", " ") ?? "";
    return return_string;
  }

  _item(key: string, data: any) {
    return findInNestedDict(data, key);
  }
}
