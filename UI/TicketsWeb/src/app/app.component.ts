import { Component, inject } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Ticket } from '../models/Ticket.model';
import { Observable } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { PagedResponse } from '../models/PagedResponse.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MatPaginatorModule,
            CommonModule,
            RouterOutlet,
            HttpClientModule,
            AsyncPipe,
            FormsModule,
            ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {

  http = inject(HttpClient);
  TicketForm : FormGroup;
  editingTicketId : number | null = null;
  tickets!: Ticket[];
  isAscending: boolean = true;
  totalItems :number | undefined;
  pageSize = 5;
  pageNumber = 1;
  pagedResponse$ = this.getAllTickets().subscribe(pagedResponse => {
    this.totalItems = pagedResponse.totalCount;
    this.tickets = pagedResponse.data
  });

  constructor(private fb: FormBuilder) {
    this.TicketForm = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(10)]],
      status: ['', [Validators.required]]
    });
  }



  private getAllTickets(): Observable<PagedResponse> {
    return this.http.get<PagedResponse>(`https://localhost:7088/api/Tickets?pageNumber=${this.pageNumber}&pageSize=${this.pageSize}`);
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize ? event.pageSize : 5;
    this.pageNumber = event.pageIndex+1;
    this.pagedResponse$ =this.getAllTickets().subscribe(pagedResponse => {
      this.totalItems = pagedResponse.totalCount;
      this.tickets = pagedResponse.data
    });
  }

  OnSubmitAddForm(){
    const AddTicketRequest = {
      description :  String(this.TicketForm.value.description),
      status : String(this.TicketForm.value.status)
    }

    if(AddTicketRequest.description || AddTicketRequest.status)
      this.http.post("https://localhost:7088/api/Tickets",AddTicketRequest)
      .subscribe({
        next : (value) => {
          console.log(value)
          this.pagedResponse$ = this.getAllTickets().subscribe(pagedResponse => {
            this.totalItems = pagedResponse.totalCount;
            this.tickets = pagedResponse.data
          });
          this.TicketForm.reset();
        },
        error : (e) => {
          console.log("Error status:", e.status);    // Logs the status code
          console.log("Error message:", e.message);  // Logs the HTTP message
          console.log("Error details:", e.error);    // Logs detailed server error response
        } 
      })
    else
      alert("Description and status are required")
  }
  OnSubmitUpdateForm(){
    const UpdateTicketRequest = {
      description :  String(this.TicketForm.value.description),
      status : String(this.TicketForm.value.status)
    }

    if(UpdateTicketRequest.description || UpdateTicketRequest.status)
      this.http.post("https://localhost:7088/api/Tickets",UpdateTicketRequest)
      .subscribe({
        next : (value) => {
          console.log(value)
          this.pagedResponse$ = this.getAllTickets().subscribe(pagedResponse => {
            this.totalItems = pagedResponse.totalCount;
            this.tickets = pagedResponse.data
          });
          this.TicketForm.reset();
        },
        error : (e) => {
          console.log("Error status:", e.status);    // Logs the status code
          console.log("Error message:", e.message);  // Logs the HTTP message
          console.log("Error details:", e.error);    // Logs detailed server error response
        }
        
      })
    else
      alert("Description and status are required")
  }

  onDelete(id : number){
    this.http.delete(`https://localhost:7088/api/Tickets/${id}`)
    .subscribe({
      next : (value) => {
        console.log(value)
        this.pagedResponse$ = this.getAllTickets().subscribe(pagedResponse => {
          this.totalItems = pagedResponse.totalCount;
          this.tickets = pagedResponse.data
        });
      },
      error : (e) => {
        console.log("Error status:", e.status);    // Logs the status code
        console.log("Error message:", e.message);  // Logs the HTTP message
        console.log("Error details:", e.error);    // Logs detailed server error response
      }
    })
  }

  editTicket(ticketId: number) {
    this.editingTicketId = ticketId;
  }

  SaveEditTicket(item : any){
    const UpdateTicketRequest = {
      id: item.ticketId,
      description :  String(item.description),
      status : String(item.status),
      date : new Date(item.date)
    }

    console.log(UpdateTicketRequest);

    this.http.put("https://localhost:7088/api/Tickets",UpdateTicketRequest)
      .subscribe({
        next : (value) => {
          this.editingTicketId = null;
          this.pagedResponse$ = this.getAllTickets().subscribe(pagedResponse => {
            this.totalItems = pagedResponse.totalCount;
            this.tickets = pagedResponse.data
          });
        },
        error : (e) => {
          console.log("Error status:", e.status);    // Logs the status code
          console.log("Error message:", e.message);  // Logs the HTTP message
          console.log("Error details:", e.error);    // Logs detailed server error response
        }
      })
    }


    sortByTicketId(): void {
      this.isAscending = !this.isAscending; // Toggle the sorting order
      this.tickets.sort((a, b) => {
        if (this.isAscending) {
          return a.ticketId - b.ticketId;
        } else {
          return b.ticketId - a.ticketId;
        }
      });
    }

  get description() { return this.TicketForm.get('description'); }
  get status() { return this.TicketForm.get('status'); }
}

