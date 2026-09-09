import { Component } from '@angular/core';
import { BUILDER, BUSINESS_INFO, CONTACT_EMAIL, isPlaceholder } from '../../../core/site-info';

/**
 * The "who operates vaani" block — legal name, entity type, address, phone,
 * email, and GSTIN (if set), plus a short bio line pointing at the builder's
 * site. Shared by the legal pages and /contact so the details live in exactly
 * one place ([[BUSINESS_INFO]] / [[BUILDER]] in core/site-info.ts).
 *
 * Any field still holding a PLACEHOLDER string renders as a visible amber pill
 * so an unfinished detail can't ship unnoticed before launch.
 */
@Component({
  selector: 'app-business-identity',
  templateUrl: './business-identity.html',
  styleUrl: './business-identity.scss',
})
export class BusinessIdentity {
  protected readonly info = BUSINESS_INFO;
  protected readonly email = CONTACT_EMAIL;
  protected readonly builder = BUILDER;
  protected readonly isPlaceholder = isPlaceholder;
}
