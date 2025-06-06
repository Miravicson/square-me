// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v2.7.0
//   protoc               v5.29.3
// source: proto/integration.proto

/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export interface ConvertCurrencyRequest {
  from: string;
  to: string;
}

export interface ConvertCurrencyResponse {
  from: string;
  to: string;
  exchangeRate: string;
}

export interface SupportedCurrenciesRequest {
}

export interface SupportedCurrenciesResponse {
  currencies: string[];
}

export interface CheckIfCurrencySupportedRequest {
  currency: string;
}

export interface CheckIfCurrencySupportedResponse {
  isSupported: boolean;
}

export interface IntegrationServiceClient {
  convertCurrency(request: ConvertCurrencyRequest): Observable<ConvertCurrencyResponse>;

  supportedCurrencies(request: SupportedCurrenciesRequest): Observable<SupportedCurrenciesResponse>;

  checkIfCurrencySupported(request: CheckIfCurrencySupportedRequest): Observable<CheckIfCurrencySupportedResponse>;
}

export interface IntegrationServiceController {
  convertCurrency(
    request: ConvertCurrencyRequest,
  ): Promise<ConvertCurrencyResponse> | Observable<ConvertCurrencyResponse> | ConvertCurrencyResponse;

  supportedCurrencies(
    request: SupportedCurrenciesRequest,
  ): Promise<SupportedCurrenciesResponse> | Observable<SupportedCurrenciesResponse> | SupportedCurrenciesResponse;

  checkIfCurrencySupported(
    request: CheckIfCurrencySupportedRequest,
  ):
    | Promise<CheckIfCurrencySupportedResponse>
    | Observable<CheckIfCurrencySupportedResponse>
    | CheckIfCurrencySupportedResponse;
}

export function IntegrationServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["convertCurrency", "supportedCurrencies", "checkIfCurrencySupported"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("IntegrationService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("IntegrationService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const INTEGRATION_SERVICE_NAME = "IntegrationService";
