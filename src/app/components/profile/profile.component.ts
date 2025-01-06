import { HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpService } from 'src/app/service/http-service/http.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  errorMessage: string = '';
  authToken: string | null = '';
  headers: HttpHeaders;
  customerData: any;
  profilePicUrl: string = '';

  constructor(
    private route: ActivatedRoute,
    private httpService: HttpService
  ) {
    // Retrieve token from localStorage and set it in the headers
    this.authToken = localStorage.getItem('authToken');
    this.headers = this.authToken
      ? new HttpHeaders().set('Authorization', `Bearer ${this.authToken}`)
      : new HttpHeaders();
  }

  ngOnInit(): void {
    if (this.authToken) {
      this.errorMessage = '';  
      this.fetchCustomerDetails();
    } else {
      this.errorMessage = 'Authorization token is missing.';
    }
  }
  fetchCustomerDetails(): void {
    if (!this.headers.has('Authorization')) {
      console.error('Authorization token is missing');
      return;
    }

    this.httpService.getCustomerById('/api/v1/customer/getcustomer', { headers: this.headers }).subscribe({
      next: (res: any) => {
        if (res.code === 200) {
          this.customerData = res.data;
          this.createImageFromBuffer(res.data.profilePhoto );
        } else {
          this.errorMessage = 'Unable to fetch customer details.';
        }
      },
      error: (err: any) => {
        this.errorMessage = 'An error occurred while fetching customer details.';
        console.error('Error fetching customer details:', err);
      }
    });
  }

  createImageFromBuffer(buffer: any): void {
    if (!buffer || !Array.isArray(buffer.data)) {
      this.errorMessage = 'Invalid buffer data';
      return;
    }
  
    const base64String = this.bufferToBase64(buffer.data);
  
    // Ensure that the base64 string has the proper prefix for image type (e.g., PNG or JPEG)
    let dataUrl = 'data:image/png;base64,' + base64String; // Change 'image/png' to the correct type if needed
    
    try {
      const imageBlob = this.base64ToBlob(base64String);  // Convert the base64 part to a Blob
      const imageUrl = URL.createObjectURL(imageBlob);  // Generate an object URL for the image
      this.profilePicUrl = imageUrl;  
    } catch (error) {
      this.errorMessage = 'Error converting buffer to image.';
      console.error('Error in createImageFromBuffer:', error);
    }
  }
  
  bufferToBase64(buffer: number[]): string {
    // Convert the buffer array (byte data) to a base64-encoded string
    const byteArray = new Uint8Array(buffer);
    
    // Process in chunks to avoid exceeding the stack size
    const chunkSize = 8192; // Adjust the chunk size if needed
    const chunks: string[] = [];
    for (let i = 0; i < byteArray.length; i += chunkSize) {
      chunks.push(String.fromCharCode(...byteArray.slice(i, i + chunkSize)));
    }
  
    return btoa(chunks.join('')); // Convert the concatenated string to Base64
  }
  
  base64ToBlob(base64: string): Blob {
    const binaryString = window.atob(base64); // Decode the base64 string
    const length = binaryString.length;
    const uintArray = new Uint8Array(length);
    
    for (let i = 0; i < length; i++) {
      uintArray[i] = binaryString.charCodeAt(i);
    }
  
    return new Blob([uintArray]);
  }
  
}
