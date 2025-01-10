import { HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpService } from 'src/app/services/http-services/http.service';

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
  isEditing: boolean = false;

  // Store original customer data for reverting on cancel
  originalCustomerData: any;

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

    this.httpService.getApiCall('/api/v1/customer/getcustomer', this.headers).subscribe({
      next: (res: any) => {
        if (res.code === 200) {
          this.customerData = res.data;
          this.originalCustomerData = { ...res.data }; // Save the original data for reverting on cancel
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

  toggleEditMode(): void {
    if (!this.isEditing) {
      // Entering edit mode - retain the current data
      this.customerData = { ...this.originalCustomerData };
    } else {
      // Canceling edit mode - revert to the original data
      this.customerData = { ...this.originalCustomerData };
    }
    this.isEditing = !this.isEditing;
  }
  createImageFromBuffer(buffer: any): void {
    if (!buffer || !Array.isArray(buffer.data)) {
      this.errorMessage = 'Invalid buffer data';
      return;
    }
  
    const base64String = this.bufferToBase64(buffer.data);
    let dataUrl = 'data:image/png;base64,' + base64String;
    
    try {
      const imageBlob = this.base64ToBlob(base64String);  
      const imageUrl = URL.createObjectURL(imageBlob);  
      this.profilePicUrl = imageUrl;  
    } catch (error) {
      this.errorMessage = 'Error converting buffer to image.';
      console.error('Error in createImageFromBuffer:', error);
    }
  }
  
  bufferToBase64(buffer: number[]): string {
    const byteArray = new Uint8Array(buffer);
    const chunkSize = 8192; 
    const chunks: string[] = [];
    for (let i = 0; i < byteArray.length; i += chunkSize) {
      chunks.push(String.fromCharCode(...byteArray.slice(i, i + chunkSize)));
    }
  
    return btoa(chunks.join('')); 
  }
  
  base64ToBlob(base64: string): Blob {
    const binaryString = window.atob(base64); 
    const length = binaryString.length;
    const uintArray = new Uint8Array(length);
    
    for (let i = 0; i < length; i++) {
      uintArray[i] = binaryString.charCodeAt(i);
    }
  
    return new Blob([uintArray]);
  }
  
  saveChanges(): void {
    console.log('Updated Customer Data:', this.customerData);
    this.originalCustomerData = { ...this.customerData };
    this.isEditing = false;
  }
}
