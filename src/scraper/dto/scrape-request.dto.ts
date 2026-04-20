import { IsString, MinLength, IsNotEmpty, IsOptional } from 'class-validator';

export class ScrapeRequestDto {
  // @IsString()
  // @IsNotEmpty()
  // @MinLength(3, { message: 'Query must be at least 3 characters long' })
  // query: string;

  // @IsOptional() @IsNumber() limit?: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Business name is too short' })
  name: string;

  // Previous: location was required
  // @IsString()
  // @IsNotEmpty()
  // @MinLength(2, { message: 'Location is too short' })
  // location: string;

  // Now: location is optional
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Location is too short' })
  location?: string;
}
